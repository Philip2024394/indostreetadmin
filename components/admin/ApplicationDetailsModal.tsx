
import React from 'react';
import { PartnerApplication } from '../../types';
import { IdCardIcon, CarIcon } from '../shared/Icons';

interface ApplicationDetailsModalProps {
  application: PartnerApplication | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading: boolean;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({ application, onClose, onApprove, onReject, loading }) => {
  if (!application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Application Details</h3>
          <p className="text-sm text-gray-500">Review and process the partner application.</p>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applicant Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 border-b pb-2 flex items-center"><IdCardIcon className="w-5 h-5 mr-2" /> Applicant Information</h4>
              <p><span className="font-medium text-gray-600">Name:</span> {application.name}</p>
              <p><span className="font-medium text-gray-600">Email:</span> {application.email}</p>
              <p><span className="font-medium text-gray-600">Phone:</span> {application.phone}</p>
              <p><span className="font-medium text-gray-600">Partner Type:</span> <span className="font-semibold text-blue-600">{application.partnerType}</span></p>
              <p><span className="font-medium text-gray-600">Submitted:</span> {new Date(application.submittedAt).toLocaleDateString()}</p>
            </div>
            
            {/* Vehicle Info */}
            {application.vehicle && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2 flex items-center"><CarIcon className="w-5 h-5 mr-2" /> Vehicle Information</h4>
                <p><span className="font-medium text-gray-600">Type:</span> {application.vehicle.type}</p>
                <p><span className="font-medium text-gray-600">Brand:</span> {application.vehicle.brand} {application.vehicle.model}</p>
                <p><span className="font-medium text-gray-600">Year:</span> {application.vehicle.year}</p>
                <p><span className="font-medium text-gray-600">License Plate:</span> {application.vehicle.licensePlate}</p>
              </div>
            )}
          </div>
          
          {/* Documents */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Documents</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {Object.entries(application.documents).map(([key, value]) => {
                if (!value) return null; // Don't render optional documents if not present
                const formattedKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                return (
                    <a key={key} href={value as string} target="_blank" rel="noopener noreferrer" className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 border transition-colors">
                        <p className="font-semibold text-blue-600 text-sm">{formattedKey}</p>
                        <p className="text-xs text-gray-500">View Document</p>
                    </a>
                )
              })}
            </div>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50" disabled={loading}>
            Close
          </button>
          <button onClick={() => onReject(application.id)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50" disabled={loading}>
            {loading ? 'Processing...' : 'Reject'}
          </button>
          <button onClick={() => onApprove(application.id)} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50" disabled={loading}>
            {loading ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;