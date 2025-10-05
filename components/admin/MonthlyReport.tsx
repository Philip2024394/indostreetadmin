import React, { useMemo } from 'react';
import { Transaction, Partner } from '../../types';

interface MonthlyReportProps {
    transactions: Transaction[];
    partnersMap: Map<string, Partner>;
    onClose: () => void;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ transactions, partnersMap, onClose }) => {
    
    const groupedTransactions = useMemo(() => {
        const groups = new Map<string, { partner: Partner; transactions: Transaction[]; subtotal: number }>();

        // Only include completed transactions in the sales report
        transactions.filter(tx => tx.status === 'completed').forEach(tx => {
            const partner = partnersMap.get(tx.partnerId);
            if (!partner) return; // Skip if partner not found

            if (!groups.has(partner.id)) {
                groups.set(partner.id, {
                    partner,
                    transactions: [],
                    subtotal: 0
                });
            }

            const group = groups.get(partner.id)!;
            group.transactions.push(tx);
            group.subtotal += tx.amount;
        });

        // Sort transactions within each group by date
        groups.forEach(group => {
            group.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });

        return Array.from(groups.values()).sort((a, b) => a.partner.profile.name?.localeCompare(b.partner.profile.name || '') || 0);
    }, [transactions, partnersMap]);

    const grandTotal = useMemo(() => {
        return groupedTransactions.reduce((acc, group) => acc + group.subtotal, 0);
    }, [groupedTransactions]);
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md print:shadow-none">
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
                `}
            </style>
            <div className="printable-area">
                <div className="flex justify-between items-center mb-6 print:mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Comprehensive Sales Report</h2>
                        <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2 print:hidden">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Close</button>
                        <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">Print Report</button>
                    </div>
                </div>

                <div className="space-y-8">
                    {groupedTransactions.map(({ partner, transactions, subtotal }) => (
                        <div key={partner.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b">
                                <h3 className="font-semibold text-gray-900">{partner.profile.name || partner.profile.shopName}</h3>
                                <p className="text-sm text-gray-600">{partner.partnerType} - {partner.email}</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-600">Details</th>
                                            <th className="px-4 py-2 text-right font-medium text-gray-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(tx => (
                                            <tr key={tx.id} className="border-b last:border-b-0">
                                                <td className="px-4 py-2 text-gray-700">{new Date(tx.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 text-gray-700">{tx.type}</td>
                                                <td className="px-4 py-2 text-gray-700">{tx.details}</td>
                                                <td className="px-4 py-2 text-right text-gray-800 font-mono">Rp {tx.amount.toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100">
                                            <td colSpan={3} className="px-4 py-2 text-right font-bold text-gray-800">Subtotal</td>
                                            <td className="px-4 py-2 text-right font-bold text-gray-800 font-mono">Rp {subtotal.toLocaleString('id-ID')}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t-2 border-gray-800">
                    <div className="flex justify-end">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">Grand Total</p>
                            <p className="text-2xl font-bold text-gray-900 font-mono">Rp {grandTotal.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;