import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Prospect } from '../../types';
import * as api from '../../services/supabase';
import ProspectFormModal from './ProspectFormModal';
import { PlusCircleIcon, PencilIcon, BellIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

interface ProspectsPageProps {
    agent: User;
}

const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() &&
           date.getMonth() === tomorrow.getMonth() &&
           date.getFullYear() === tomorrow.getFullYear();
};

const ProspectsPage: React.FC<ProspectsPageProps> = ({ agent }) => {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getProspectsForAgent(agent.id);
            setProspects(data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error("Failed to fetch prospects:", error);
        } finally {
            setLoading(false);
        }
    }, [agent.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (data: Omit<Prospect, 'id' | 'agentId' | 'createdAt' | 'status'>, id?: string) => {
        try {
            if (id) {
                // Agent can only edit notes and callback times for existing prospects
                const { meetingNotes, callbackDateTime } = data;
                await api.updateProspect(id, { meetingNotes, callbackDateTime });
            } else {
                await api.createProspect(agent.id, data);
            }
            fetchData();
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to save prospect:", error);
        }
    };
    
    const handleStatusToggle = async (prospect: Prospect, agreed: boolean) => {
        if (agreed) {
            if (window.confirm(`This will submit "${prospect.name}" to the admin for approval. You will not be able to edit the prospect's details afterwards, but you can still cancel this submission. Continue?`)) {
                try {
                    await api.updateProspect(prospect.id, { status: 'pending_approval' });
                    fetchData();
                } catch (error) {
                    console.error("Failed to update prospect status:", error);
                }
            }
        } else {
            if (window.confirm(`Are you sure you want to cancel this submission? The admin will no longer see this as a pending application.`)) {
                try {
                    await api.updateProspect(prospect.id, { status: 'prospect' });
                    fetchData();
                } catch (error) {
                    console.error("Failed to revert prospect status:", error);
                }
            }
        }
    };

    const statusBadge = (status: Prospect['status']) => {
        const classes: Record<Prospect['status'], string> = {
            prospect: 'bg-gray-100 text-gray-800',
            agreed_to_join: 'bg-blue-100 text-blue-800',
            pending_approval: 'bg-yellow-100 text-yellow-800',
            active_partner: 'bg-green-100 text-green-800',
        };
        return classes[status];
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">My Prospects</h3>
                    <button onClick={() => { setEditingProspect(null); setIsFormOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Add Prospect
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prospect</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Callback</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agreed to Join?</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {prospects.map(p => {
                                const callbackDate = p.callbackDateTime ? new Date(p.callbackDateTime) : null;
                                const isCallbackTomorrow = callbackDate ? isTomorrow(callbackDate) : false;

                                return (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-medium text-gray-900">{p.name}</p>
                                        <p className="text-sm text-gray-500">{p.partnerType}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                        {callbackDate ? (
                                            <span className={`flex items-center ${isCallbackTomorrow ? 'font-bold text-red-600' : ''}`}>
                                                {isCallbackTomorrow && <BellIcon className="w-4 h-4 mr-1 animate-pulse" />}
                                                {callbackDate.toLocaleDateString()}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusBadge(p.status)}`}>
                                            {p.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ToggleSwitch 
                                            enabled={p.status === 'pending_approval' || p.status === 'active_partner'} 
                                            onChange={(val) => handleStatusToggle(p, val)}
                                            disabled={p.status === 'active_partner'}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button 
                                            onClick={() => { setEditingProspect(p); setIsFormOpen(true); }}
                                            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 disabled:opacity-50"
                                            disabled={p.status !== 'prospect'}
                                            title={p.status !== 'prospect' ? 'Cannot edit after submission' : 'Edit notes & callback'}
                                        >
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
             {isFormOpen && (
                <ProspectFormModal
                    prospect={editingProspect}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default ProspectsPage;