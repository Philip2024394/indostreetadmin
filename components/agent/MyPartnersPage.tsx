import React, { useState, useEffect, useCallback } from 'react';
import { User, Partner } from '../../types';
import * as api from '../../services/supabase';

interface MyPartnersPageProps {
    agent: User;
}

const MyPartnersPage: React.FC<MyPartnersPageProps> = ({ agent }) => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getPartnersForAgent(agent.id);
            setPartners(data);
        } catch (error) {
            console.error("Failed to fetch partners:", error);
        } finally {
            setLoading(false);
        }
    }, [agent.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <p>Loading your partners...</p>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-800">My Signed Partners</h3>
                <p className="text-sm text-gray-500">A list of all partners you have successfully onboarded.</p>
            </div>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Member Since</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Renewal Date</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {partners.length > 0 ? partners.map(partner => (
                             <tr key={partner.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="font-medium text-gray-900">{partner.profile.name || partner.profile.shopName}</p>
                                    <p className="text-sm text-gray-500">{partner.partnerType}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm">{new Date(partner.memberSince).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{partner.activationExpiry ? new Date(partner.activationExpiry).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-500">You have not signed up any partners yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyPartnersPage;
