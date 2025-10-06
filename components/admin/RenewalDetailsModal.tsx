import React from 'react';
import { RenewalSubmission } from '../../types';
import { XIcon } from '../shared/Icons';

interface RenewalDetailsModalProps {
  submission: RenewalSubmission | null;
  onClose: () => void;
  onApprove: (submission: RenewalSubmission) => void;
  onReject: (submission: RenewalSubmission) => void;
  loading: boolean;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-gray-800 font-semibold">{value}</p>
    </div>
);

const RenewalDetailsModal: React.FC<RenewalDetailsModalProps> = ({ submission, onClose, onApprove, onReject, loading }) => {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
            <div>
                <h3 className="text-xl font-semibold text-gray-800">Review Renewal Submission</h3>
                <p className="text-sm text-gray-500">Verify payment and process the partner's membership renewal.</p>
            </div>
             <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem label="Partner Name" value={submission.partnerName} />
            <DetailItem label="Submitted At" value={new Date(submission.submittedAt).toLocaleString()} />
            <DetailItem label="Selected Package" value={`${submission.selectedPackage} Months`} />
            <DetailItem label="Payment Method" value={submission.paymentMethod} />
            <DetailItem label="Transaction Number" value={submission.transactionNumber} />
            
            <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-2">Payment Receipt</p>
                <a href={submission.receiptImage} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500">
                    <img 
                        src={submission.receiptImage} 
                        alt="Payment Receipt" 
                        className="w-full h-auto object-contain max-h-96"
                    />
                </a>
            </div>
        </div>
        <div className="p-6 border-t flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50" disabled={loading}>
            Close
          </button>
          <button onClick={() => onReject(submission)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50" disabled={loading}>
            {loading ? 'Processing...' : 'Reject'}
          </button>
          <button onClick={() => onApprove(submission)} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50" disabled={loading}>
            {loading ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalDetailsModal;