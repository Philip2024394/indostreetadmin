import React, { useState, useEffect, useCallback } from 'react';
import { Partner, Transaction, AdminMessage } from '../../types';
import { supabase } from '../../services/supabase';
import { ChevronLeftIcon, UserCircleIcon, StarIcon, BriefcaseIcon, CheckIcon, PaperAirplaneIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

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

const AccountManagement: React.FC<{ partner: Partner; onUpdate: (data: Partial<Partner>) => void }> = ({ partner, onUpdate }) => {
    
    const handleStatusToggle = (enabled: boolean) => {
        onUpdate({ status: enabled ? 'active' : 'suspended' });
    };

    const handleSetExpiry = (months: number) => {
        const newExpiryDate = new Date();
        newExpiryDate.setMonth(newExpiryDate.getMonth() + months);
        onUpdate({ activationExpiry: newExpiryDate.toISOString() });
    };
    
    const expiryDate = partner.activationExpiry ? new Date(partner.activationExpiry) : null;
    const isExpired = expiryDate && expiryDate < new Date();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Management</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Account Status</span>
                    <ToggleSwitch enabled={partner.status === 'active'} onChange={handleStatusToggle} enabledText="Active" disabledText="Suspended" />
                </div>
                <div className="text-sm">
                    <span className="font-medium text-gray-700">Activation Expires:</span>
                    {expiryDate ? (
                        <span className={`ml-2 font-semibold ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
                            {expiryDate.toLocaleDateString()}
                            {isExpired && " (Expired)"}
                        </span>
                    ) : (
                        <span className="ml-2 text-gray-500">Not set</span>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Set Activation Period:</p>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleSetExpiry(3)} className="px-2 py-2 text-xs text-white bg-blue-500 rounded hover:bg-blue-600">3 Months</button>
                        <button onClick={() => handleSetExpiry(6)} className="px-2 py-2 text-xs text-white bg-blue-500 rounded hover:bg-blue-600">6 Months</button>
                        <button onClick={() => handleSetExpiry(12)} className="px-2 py-2 text-xs text-white bg-blue-500 rounded hover:bg-blue-600">12 Months</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PartnerChat: React.FC<{ partner: Partner }> = ({ partner }) => {
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from('admin_messages').select('*');
        if (data) {
            const partnerMessages = data
                .filter(m => m.recipientId === partner.id || m.recipientId === 'all')
                .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
            setMessages(partnerMessages);
        }
        setLoading(false);
    }, [partner.id]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        
        await supabase.from('admin_messages').insert({
            recipientId: partner.id,
            content: newMessage,
        });

        setNewMessage('');
        fetchMessages(); // Refresh messages
    };

    return (
        <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
            <h3 className="text-lg font-semibold text-gray-800 p-6 border-b">Chat with Partner</h3>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto h-64 bg-gray-50">
                {loading ? <p>Loading messages...</p> : messages.map(msg => (
                    <div key={msg.id} className="flex flex-col items-end">
                        <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                            <p className="text-sm">{msg.content}</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <span>{new Date(msg.sentAt).toLocaleTimeString()}</span>
                            {msg.readBy.includes(partner.id) && <CheckIcon className="w-4 h-4 ml-1 text-green-500" title="Read by partner" />}
                        </div>
                    </div>
                ))}
                {messages.length === 0 && !loading && <p className="text-center text-gray-500">No messages yet.</p>}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow border rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700">
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};


const PartnerDetails: React.FC<PartnerDetailsProps> = ({ partner, onBack }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPartner, setCurrentPartner] = useState(partner);

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

    const handlePartnerUpdate = async (updatedData: Partial<Partner>) => {
        const { data } = await supabase.from('partners').update(updatedData).eq('id', partner.id);
        if (data) {
            setCurrentPartner(data[0]);
        }
    };
    
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
                         <img className="h-20 w-20 rounded-full" src={currentPartner.profile.profilePicture || `https://ui-avatars.com/api/?name=${currentPartner.profile.name}&background=random`} alt="" />
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-gray-800">{currentPartner.profile.name || currentPartner.profile.shopName}</h2>
                            <p className="text-sm text-gray-500">{currentPartner.partnerType}</p>
                            <p className="text-sm text-gray-500">{currentPartner.email} | {currentPartner.phone}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Overall Rating" value={`${currentPartner.rating.toFixed(1)} ★`} icon={<StarIcon className="w-6 h-6" />} />
                <StatCard title="Total Earnings" value={`Rp ${currentPartner.totalEarnings.toLocaleString('id-ID')}`} icon={<BriefcaseIcon className="w-6 h-6" />} />
                <StatCard title="Member Since" value={new Date(currentPartner.memberSince).toLocaleDateString()} icon={<UserCircleIcon className="w-6 h-6" />} />
            </div>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                <div className="xl:col-span-1">
                    <AccountManagement partner={currentPartner} onUpdate={handlePartnerUpdate} />
                </div>
                <div className="xl:col-span-2">
                     <PartnerChat partner={currentPartner} />
                </div>
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