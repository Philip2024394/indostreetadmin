
import React, { useState, useEffect, useCallback } from 'react';
import { Partner, Transaction } from '../../types';
import { supabase } from '../../services/supabase';
import { ChevronLeftIcon, UserCircleIcon, StarIcon, BriefcaseIcon } from '../shared/Icons';

interface PartnerDetailsProps {
    partner: Partner;
    onBack: () => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-center">
        <div className="bg-gray-100 text-gray-600 p-3 rounded-full mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const PartnerDetails: React.FC<PartnerDetailsProps> = ({ partner, onBack }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from('transactions').select('*').eq('partnerId', partner.id);
        if (data) {
            setTransactions(data);
        }
        setLoading(false);
    }, [partner.id]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);
    
     const statusBadge = (status: 'completed' | 'cancelled' | 'in_progress') => {
        const classes = {
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            in_progress: 'bg-yellow-100 text-yellow-800'
        };
        return classes[status];
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Partner Directory
            </button>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-6 md:flex md:items-center md:justify-between">
                    <div className="flex items-center">
                         <img className="h-20 w-20 rounded-full" src={partner.profile.profilePicture || `https://ui-avatars.com/api/?name=${partner.profile.name}&background=random`} alt="" />
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-gray-800">{partner.profile.name || partner.profile.shopName}</h2>
                            <p className="text-sm text-gray-500">{partner.partnerType}</p>
                            <p className="text-sm text-gray-500">{partner.email} | {partner.phone}</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Suspend Partner</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Send Message</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Overall Rating" value={`${partner.rating.toFixed(1)} ★`} icon={<StarIcon className="w-6 h-6" />} />
                <StatCard title="Total Earnings" value={`Rp ${partner.totalEarnings.toLocaleString('id-ID')}`} icon={<BriefcaseIcon className="w-6 h-6" />} />
                <StatCard title="Member Since" value={new Date(partner.memberSince).toLocaleDateString()} icon={<UserCircleIcon className="w-6 h-6" />} />
            </div>

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Recent Transactions</h3>
                </div>
                 <div className="overflow-x-auto">
                    {loading ? <p className="p-6 text-center text-gray-500">Loading transactions...</p> : (
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                             </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.length > 0 ? transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.date).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{tx.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.details}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {tx.amount.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(tx.status)}`}>{tx.status.replace('_', ' ')}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="text-center py-10 px-6 text-gray-500">No transactions found for this partner.</td></tr>
                                )}
                              </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartnerDetails;