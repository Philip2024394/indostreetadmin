import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { AgentApplication } from '../../types';
import AgentApplicationDetailsModal from './AgentApplicationDetailsModal';

const AgentApplicationManagementPage: React.FC = () => {
    const [applications, setApplications] = useState<AgentApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<AgentApplication | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getAgentApplications();
            setApplications(data);
        } catch (error) {
            console.error("Failed to fetch agent applications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProcessApplication = async (id: string, status: 'approved' | 'rejected') => {
        setActionLoading(true);
        try {
            await api.updateAgentApplicationStatus(id, status);
            await fetchData();
        } catch (error) {
            console.error(`Failed to ${status} agent application:`, error);
        } finally {
            setActionLoading(false);
            setSelectedApp(null);
        }
    };
    
    const filteredApplications = useMemo(() => {
        return applications.filter(app => app.status === filter);
    }, [applications, filter]);
    
    const statusBadge = (status: AgentApplication['status']) => {
        const classes = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return classes[status];
    };

    if (loading) {
        return <div className="text-center p-10">Loading agent applications...</div>;
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Agent Applications</h3>
                    <p className="text-sm text-gray-500">Review, approve, or reject applications from prospective agents.</p>
                     <div className="mt-4 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6">
                            {(['pending', 'approved', 'rejected'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={`${filter === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Submitted At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
                            </tr>
                         </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredApplications.length > 0 ? filteredApplications.map(app => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                                        <div className="text-sm text-gray-500">{app.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-500">{new Date(app.submittedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(app.status)}`}>{app.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedApp(app)} className="text-blue-600 hover:text-blue-900">View Details</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 px-6 text-gray-500">No {filter} applications found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedApp && (
                <AgentApplicationDetailsModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onApprove={(id) => handleProcessApplication(id, 'approved')}
                    onReject={(id) => handleProcessApplication(id, 'rejected')}
                    loading={actionLoading}
                />
            )}
        </>
    );
};

export default AgentApplicationManagementPage;
