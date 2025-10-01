import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/supabase';
import { RenewalSubmission, Partner } from '../../types';
import RenewalDetailsModal from './RenewalDetailsModal';

interface RenewalManagementPageProps {
    onPartnerSelect: (partner: Partner) => void;
}

const RenewalManagementPage: React.FC<RenewalManagementPageProps> = ({ onPartnerSelect }) => {
    const [submissions, setSubmissions] = useState<RenewalSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<RenewalSubmission | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getRenewalSubmissions();
            setSubmissions(data);
        } catch (error) {
            console.error("Failed to fetch renewal submissions:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProcessSubmission = async (submission: RenewalSubmission, status: 'approved' | 'rejected') => {
        setActionLoading(true);
        try {
            if (status === 'approved') {
                const partner = await api.getPartner(submission.partnerId);
                const currentExpiry = partner.activationExpiry ? new Date(partner.activationExpiry) : new Date();
                // Start new period from expiry date, or from today if already expired
                const startDate = currentExpiry > new Date() ? currentExpiry : new Date();
                
                const newExpiryDate = new Date(startDate);
                newExpiryDate.setMonth(newExpiryDate.getMonth() + submission.selectedPackage);
                
                await api.updatePartner(submission.partnerId, { activationExpiry: newExpiryDate.toISOString() });
            }
            await api.updateRenewalSubmission(submission.id, { status });
            await fetchData();
        } catch (error) {
            console.error(`Failed to ${status} submission:`, error);
            alert(`Error processing submission. Please try again.`);
        } finally {
            setActionLoading(false);
            setSelectedSubmission(null);
        }
    };

    const statusBadge = (status: 'pending' | 'approved' | 'rejected') => {
        const classes = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return classes[status];
    };
    
    const handleViewPartner = async (partnerId: string) => {
        try {
            const partner = await api.getPartner(partnerId);
            onPartnerSelect(partner);
        } catch(e){
            console.error("Failed to get partner", e);
        }
    }

    if (loading) {
        return <div className="text-center p-10">Loading renewal submissions...</div>;
    }

    const pendingSubmissions = submissions.filter(s => s.status === 'pending');

    return (
        <>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Pending Renewals</h3>
                    <p className="text-sm text-gray-500">Review and process partner membership renewal payments.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Submitted At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingSubmissions.length > 0 ? pendingSubmissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleViewPartner(sub.partnerId)} className="text-sm font-medium text-blue-600 hover:underline">{sub.partnerName}</button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-500">{new Date(sub.submittedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{sub.selectedPackage} Months</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(sub.status)}`}>{sub.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedSubmission(sub)} className="text-blue-600 hover:text-blue-900">View Details</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 px-6 text-gray-500">No pending renewal submissions.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedSubmission && (
                <RenewalDetailsModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    onApprove={(sub) => handleProcessSubmission(sub, 'approved')}
                    onReject={(sub) => handleProcessSubmission(sub, 'rejected')}
                    loading={actionLoading}
                />
            )}
        </>
    );
};

export default RenewalManagementPage;
