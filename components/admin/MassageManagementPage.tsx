import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { Partner, PartnerType } from '../../types';
// import MassagePartnerFormModal from './MassagePartnerFormModal';
import { PlusCircleIcon, PencilIcon, TrashIcon, SearchIcon, SparklesIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

interface MassageManagementPageProps {
    onPartnerSelect: (partner: Partner) => void;
}

const MassageManagementPage: React.FC<MassageManagementPageProps> = ({ onPartnerSelect }) => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    // const [isFormOpen, setIsFormOpen] = useState(false);
    // const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | PartnerType.MassageTherapist | PartnerType.MassagePlace>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'busy' | 'offline'>('all');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getPartners();
            const massagePartners = data.filter(p => p.partnerType === PartnerType.MassageTherapist || p.partnerType === PartnerType.MassagePlace);
            setPartners(massagePartners);
        } catch (error) {
            console.error("Failed to fetch massage partners:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAccountStatusUpdate = async (partner: Partner, status: 'active' | 'suspended') => {
        // Optimistic update
        setPartners(prev => prev.map(p => p.id === partner.id ? {...p, status} : p));
        try {
            await api.updatePartner(partner.id, { status });
        } catch(e) {
            console.error("Failed to update status", e);
            fetchData(); // revert
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this partner? This action is permanent.')) {
            try {
                // This is a mock implementation. In a real app, you would call an API to delete the partner.
                 console.log(`Pretending to delete partner ${id}`);
                 setPartners(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error("Failed to delete partner:", error);
                alert("Could not delete partner.");
            }
        }
    };

    const filteredPartners = useMemo(() => {
        return partners.filter(p => {
            const searchMatch = searchTerm === '' || 
                (p.profile.name || p.profile.shopName || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const typeMatch = typeFilter === 'all' || p.partnerType === typeFilter;

            const statusMatch = statusFilter === 'all' || p.massageStatus === statusFilter;

            return searchMatch && typeMatch && statusMatch;
        });
    }, [partners, searchTerm, typeFilter, statusFilter]);
    
    const massageStatusBadge = (status: 'online' | 'busy' | 'offline' | undefined) => {
        const classes = {
            online: 'bg-green-100 text-green-800',
            busy: 'bg-yellow-100 text-yellow-800',
            offline: 'bg-gray-100 text-gray-800'
        };
        return status ? classes[status] : 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 sm:p-6 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Massage & Wellness Partners</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage all registered massage therapists and places.</p>
                        </div>
                        {/* <button 
                            // onClick={handleAddNew}
                            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add New Partner
                        </button> */}
                    </div>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="Search by Name..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm"
                            />
                        </div>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="border border-gray-300 rounded-md sm:text-sm py-2">
                            <option value="all">All Types</option>
                            <option value={PartnerType.MassageTherapist}>Therapist (Home Service)</option>
                            <option value={PartnerType.MassagePlace}>Massage Place (Spa)</option>
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="border border-gray-300 rounded-md sm:text-sm py-2">
                             <option value="all">All Service Statuses</option>
                             <option value="online">Online</option>
                             <option value="busy">Busy</option>
                             <option value="offline">Offline</option>
                        </select>
                     </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? <p className="p-6 text-center text-gray-500">Loading partners...</p> : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Account Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Rating</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPartners.length > 0 ? filteredPartners.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-full" src={p.profile.profilePicture} alt={p.profile.name || p.profile.shopName} />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{p.profile.name || p.profile.shopName}</div>
                                                    <div className="text-sm text-gray-500">{p.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{p.partnerType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${massageStatusBadge(p.massageStatus)}`}>
                                            {p.massageStatus || 'N/A'}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                            <ToggleSwitch enabled={p.status === 'active'} onChange={(enabled) => handleAccountStatusUpdate(p, enabled ? 'active' : 'suspended')} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">{p.rating.toFixed(1)} ★</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => onPartnerSelect(p)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="text-center py-10 px-6 text-gray-500">No massage partners found matching your filters.</td></tr>
                                )}
                             </tbody>
                        </table>
                    )}
                </div>
            </div>
            {/* {isFormOpen && (
                <MassagePartnerFormModal 
                    partner={editingPartner}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                />
            )} */}
        </>
    );
};

export default MassageManagementPage;
