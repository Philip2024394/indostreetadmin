import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { User, Prospect } from '../../types';
import { BriefcaseIcon, CheckCircleIcon } from '../shared/Icons';

const AgentManagementPage: React.FC = () => {
    const [agents, setAgents] = useState<User[]>([]);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [agentsData, prospectsData] = await Promise.all([
                api.getAgents(),
                api.getAllProspects(),
            ]);
            setAgents(agentsData);
            setProspects(prospectsData);
        } catch (error) {
            console.error("Failed to fetch agent data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const pendingSignups = useMemo(() => {
        return prospects.filter(p => p.status === 'pending_approval');
    }, [prospects]);

    const agentMap = useMemo(() => {
        return new Map(agents.map(agent => [agent.id, agent]));
    }, [agents]);

    if (loading) {
        return <div className="text-center p-10">Loading agent data...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">New Signups to Process</h3>
                    <p className="text-sm text-gray-500">These prospects have been marked as "agreed to join" by an agent. Please review and process their application.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prospect Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Business Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Agent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {pendingSignups.length > 0 ? pendingSignups.map(prospect => (
                                <tr key={prospect.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-medium text-gray-900">{prospect.name}</p>
                                        <p className="text-sm text-gray-500">{prospect.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{prospect.partnerType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{agentMap.get(prospect.agentId)?.profile.name || 'Unknown Agent'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <a href="#" onClick={() => alert('This would take you to the application page.')} className="text-blue-600 hover:underline">View Application</a>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">No new signups are pending approval.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">All Agents</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {agents.map(agent => (
                        <div key={agent.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                                <img src={agent.profile.profilePicture} alt={agent.profile.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-gray-800">{agent.profile.name}</p>
                                    <p className="text-sm text-gray-600">{agent.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Partners Signed</p>
                                <p className="font-bold text-lg text-gray-800">{prospects.filter(p => p.agentId === agent.id && p.status === 'active_partner').length}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgentManagementPage;
