

import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/supabase';
import { Transaction, Partner } from '../../types';
import StatCard from './StatCard';
import MonthlyReport from './MonthlyReport';
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon, SearchIcon } from '../shared/Icons';

const INDOSTREET_CUT_PERCENTAGE = 0.20; // 20%

const FinancialsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [transactionsData, partnersData] = await Promise.all([
                    api.getTransactions(),
                    api.getPartners(),
                ]);
                setTransactions(transactionsData);
                setPartners(partnersData);
            } catch (error) {
                console.error("Failed to fetch financial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const partnersMap = useMemo(() => {
        const map = new Map<string, Partner>();
        partners.forEach(p => map.set(p.id, p));
        return map;
    }, [partners]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const partner = partnersMap.get(tx.partnerId);
            const partnerName = partner?.profile.name || partner?.profile.shopName || '';
            
            const searchMatch = searchTerm === '' ||
                partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.details.toLowerCase().includes(searchTerm.toLowerCase());

            const statusMatch = statusFilter === 'all' || tx.status === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [transactions, searchTerm, statusFilter, partnersMap]);

    const financialStats = useMemo(() => {
        const completedTransactions = transactions.filter(tx => tx.status === 'completed');
        const totalRevenue = completedTransactions.reduce((acc, tx) => acc + tx.amount, 0);
        const indoStreetCut = totalRevenue * INDOSTREET_CUT_PERCENTAGE;
        const partnerPayouts = totalRevenue - indoStreetCut;
        return { totalRevenue, indoStreetCut, partnerPayouts };
    }, [transactions]);
    
    const statusBadge = (status: 'completed' | 'cancelled' | 'in_progress') => {
        const classes = {
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            in_progress: 'bg-yellow-100 text-yellow-800'
        };
        return classes[status];
    };

    if (loading) {
        return <div className="text-center p-10">Loading financial data...</div>;
    }
    
    if (showReport) {
        return <MonthlyReport transactions={transactions} partnersMap={partnersMap} onClose={() => setShowReport(false)} />;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={`Rp ${financialStats.totalRevenue.toLocaleString('id-ID')}`} icon={<DollarSignIcon className="w-6 h-6" />} />
                <StatCard title="Payouts to Partners" value={`Rp ${financialStats.partnerPayouts.toLocaleString('id-ID')}`} icon={<TrendingUpIcon className="w-6 h-6" />} />
                <StatCard title="IndoStreet's Cut" value={`Rp ${financialStats.indoStreetCut.toLocaleString('id-ID')}`} icon={<TrendingDownIcon className="w-6 h-6" />} />
            </div>

            <div className="bg-white rounded-lg shadow-md">
                 <div className="p-4 border-b space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
                        <p className="text-sm text-gray-500">View all transactions across the platform.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                         <button 
                            onClick={() => setShowReport(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
                        >
                            Generate Comprehensive Report
                        </button>
                    </div>
                 </div>
                 <div className="p-4 border-b flex items-center space-x-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by partner or details..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-md sm:text-sm py-2"
                    >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                         </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTransactions.map(tx => {
                                    const partner = partnersMap.get(tx.partnerId);
                                    return (
                                        <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{partner?.profile.name || partner?.profile.shopName}</div>
                                                <div className="text-sm text-gray-500">{partner?.partnerType}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{new Date(tx.date).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{tx.type}</div>
                                                <div className="text-sm text-gray-500">{tx.details}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {tx.amount.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(tx.status)}`}>{tx.status.replace('_', ' ')}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                          </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default FinancialsPage;