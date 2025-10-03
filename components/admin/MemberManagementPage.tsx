import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { Member } from '../../types';
import { SearchIcon, UserCircleIcon, ChevronDownIcon } from '../shared/Icons';

const MemberManagementPage: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getMembers();
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch members:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleStatusUpdate = async (memberId: string, status: Member['status']) => {
        if (window.confirm(`Are you sure you want to set this member's status to "${status}"?`)) {
            try {
                await api.updateMember(memberId, { status });
                fetchMembers(); // Refresh data
            } catch (error) {
                console.error("Failed to update member status:", error);
                alert("An error occurred. Please try again.");
            }
        }
        setActiveDropdown(null);
    };

    const filteredMembers = useMemo(() => {
        return members.filter(member =>
            (member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             member.whatsappNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [members, searchTerm]);

    const statusBadge = (status: Member['status']) => {
        const classes: Record<Member['status'], string> = {
            active: 'bg-green-100 text-green-800',
            suspended: 'bg-red-100 text-red-800',
            warned: 'bg-yellow-100 text-yellow-800',
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="text-center p-10">Loading member data...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Member Directory</h3>
                        <p className="text-sm text-gray-500 mt-1">View and manage all registered platform users.</p>
                    </div>
                     <div className="relative mt-4 sm:mt-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or WhatsApp..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Last Known Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Member Since</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMembers.length > 0 ? filteredMembers.map(member => (
                            <tr key={member.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{member.name || 'N/A'}</div>
                                    <div className="text-sm text-gray-500">{member.whatsappNumber}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{member.lastKnownLocation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{new Date(member.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusBadge(member.status)}`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                    <button
                                        onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Actions
                                        <ChevronDownIcon className="w-4 h-4 ml-2" />
                                    </button>
                                    {activeDropdown === member.id && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                <button
                                                    onClick={() => handleStatusUpdate(member.id, 'active')}
                                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    disabled={member.status === 'active'}
                                                >
                                                    Set to Active
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(member.id, 'warned')}
                                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    disabled={member.status === 'warned'}
                                                >
                                                    Set to Warned
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(member.id, 'suspended')}
                                                    className="w-full text-left block px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                                    disabled={member.status === 'suspended'}
                                                >
                                                    Set to Suspended
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-10 px-6 text-gray-500">No members found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberManagementPage;
