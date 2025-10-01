
import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction, Partner } from '../../types';
import * as api from '../../services/supabase';
import { DollarSignIcon, TrendingUpIcon } from '../shared/Icons';

interface EarningsAndHistoryProps {
  user: User;
}

const EarningsAndHistory: React.FC<EarningsAndHistoryProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [partnerData, transactionsData] = await Promise.all([
            api.getPartner(user.id),
            api.getTransactionsForPartner(user.id)
        ]);
        setPartner(partnerData);
        const sortedData = transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(sortedData);
    } catch (error) {
        console.error("Failed to fetch earnings and history:", error);
    } finally {
        setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statusBadge = (status: 'completed' | 'cancelled' | 'in_progress') => {
    const classes = {
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        in_progress: 'bg-yellow-100 text-yellow-800'
    };
    return classes[status];
  };

  if (loading) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">Loading earnings...</p>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Earnings & History</h3>
        <p className="text-sm text-gray-500 mt-1">Your total earnings and recent transaction history.</p>
      </div>
      
      {partner && (
        <div className="p-6 border-b bg-gray-50">
           <div className="bg-white p-4 rounded-lg shadow-inner flex items-center">
                <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
                    <DollarSignIcon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-800">
                        Rp {partner.totalEarnings.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length > 0 ? transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tx.type}</div>
                    <div className="text-sm text-gray-500">{tx.details}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    Rp {tx.amount.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(tx.status)}`}>
                    {tx.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="text-center py-10 px-6 text-gray-500">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EarningsAndHistory;
