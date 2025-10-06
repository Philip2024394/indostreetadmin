import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction } from '../../types';
import * as api from '../../services/supabase';
import { Editable } from '../shared/Editable';
import { ClipboardListIcon, ExclamationCircleIcon, CheckIcon, XIcon } from '../shared/Icons';

interface LiveOrdersProps {
  user: User;
}

const LiveOrders: React.FC<LiveOrdersProps> = ({ user }) => {
    const [orders, setOrders] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTransactionsForPartner(user.id);
            if(data) {
                const inProgressOrders = data
                    .filter(tx => tx.status === 'in_progress' && tx.type === 'Order')
                    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setOrders(inProgressOrders);
            }
        } catch (error) {
            console.error("Failed to fetch live orders:", error);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchOrders(); // Initial fetch

        const channel = api.supabase
            .channel(`public:transactions:partnerId=eq.${user.id}`)
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'transactions',
                    filter: `partnerId=eq.${user.id}`
                }, 
                (payload) => {
                    const newOrder = payload.new as Transaction;
                    if (newOrder.type === 'Order' && newOrder.status === 'in_progress') {
                        setOrders(prev => [newOrder, ...prev].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
                    }
                }
            )
            .subscribe();

        return () => {
            api.supabase.removeChannel(channel);
        };
    }, [fetchOrders, user.id]);

    const handleUpdateStatus = async (orderId: string, status: 'completed' | 'cancelled') => {
        setOrders(prev => prev.filter(o => o.id !== orderId)); // Optimistic update
        try {
            await api.updateTransaction(orderId, { status });
            // No need to refetch, already handled by optimistic update and polling
        } catch (error) {
            console.error("Failed to update order status:", error);
            fetchOrders(); // Revert on failure
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-800">
                    <Editable editId="vendor-live-orders-title" type="text" defaultValue="Live Orders" />
                </h3>
                <p className="text-sm text-gray-500 mt-1">New incoming orders will appear below.</p>
            </div>
            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <ClipboardListIcon className="w-12 h-12 mx-auto text-gray-300" />
                        <p className="text-gray-500 font-medium mt-2">No new orders</p>
                        <p className="text-sm text-gray-400 mt-1">We'll notify you when a new order arrives.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-800">New Order</p>
                                    <p className="text-sm text-gray-600 mt-1">{order.details}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-lg font-bold text-gray-800">Rp {order.amount.toLocaleString('id-ID')}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.date).toLocaleTimeString()}</p>
                                </div>
                            </div>
                             <div className="mt-4 pt-4 border-t border-yellow-200 flex space-x-3">
                                <button
                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                >
                                    <CheckIcon className="w-5 h-5 mr-2"/> Accept
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    <XIcon className="w-5 h-5 mr-2"/> Decline
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LiveOrders;