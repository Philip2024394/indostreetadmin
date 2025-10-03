import React, { useState, useEffect, useCallback } from 'react';
import { User, Partner } from '../../types';
import * as api from '../../services/supabase';

interface RenewalsPageProps {
    agent: User;
}

const RenewalsPage: React.FC<RenewalsPageProps> = ({ agent }) => {
    const [expiringPartners, setExpiringPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const partners = await api.getPartnersForAgent(agent.id);
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            
            const expiring = partners.filter(p => {
                if (!p.activationExpiry) return false;
                const expiryDate = new Date(p.activationExpiry);
                return expiryDate <= sevenDaysFromNow;
            });
            setExpiringPartners(expiring);

        } catch (error) {
            console.error("Failed to fetch partners for renewal:", error);
        } finally {
            setLoading(false);
        }
    }, [agent.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <p>Loading renewal information...</p>;
    }
    
    const getDaysUntilExpiry = (expiry: string) => {
        const diff = new Date(expiry).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    }


    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-800">Renewal Follow-ups</h3>
                <p className="text-sm text-gray-500">These partners' memberships are expiring within the next 7 days.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires In</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {expiringPartners.length > 0 ? expiringPartners.map(partner => {
                            const days = getDaysUntilExpiry(partner.activationExpiry!);
                            return (
                                <tr key={partner.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-medium text-gray-900">{partner.profile.name || partner.profile.shopName}</p>
                                        <p className="text-sm text-gray-500">{partner.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`font-bold ${days <= 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                            {days <= 0 ? 'Expired' : `${days} day(s)`}
                                        </span>
                                    </td>
                                </tr>
                            )
                        }) : (
                             <tr>
                                <td colSpan={2} className="text-center py-10 text-gray-500">No partners are up for renewal soon.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RenewalsPage;
