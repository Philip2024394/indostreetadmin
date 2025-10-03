import React from 'react';
import { AgentApplication } from '../../types';
import { XIcon } from '../shared/Icons';

interface AgentApplicationDetailsModalProps {
  application: AgentApplication | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading: boolean;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="border p-4 rounded-md">
        <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">{title}</h4>
        <div className="space-y-2 text-sm">{children}</div>
    </div>
);

const DetailItem: React.FC<{ label: string; value?: string | number | React.ReactNode; }> = ({ label, value }) => (
    <p><span className="font-medium text-gray-600">{label}:</span> {value}</p>
);

const AgentApplicationDetailsModal: React.FC<AgentApplicationDetailsModalProps> = ({ application, onClose, onApprove, onReject, loading }) => {
  if (!application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
            <div>
                <h3 className="text-xl font-semibold text-gray-800">Agent Application Details</h3>
                <p className="text-sm text-gray-500">Review and process the agent's application.</p>
            </div>
             <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <DetailSection title="Personal Information">
                    <DetailItem label="Full Name" value={application.name} />
                    <DetailItem label="Email" value={application.email} />
                    <DetailItem label="WhatsApp" value={application.whatsapp} />
                    <DetailItem label="NIK" value={application.nik} />
                    <DetailItem label="Age" value={application.age} />
                    <DetailItem label="Address" value={application.address} />
                </DetailSection>
                <DetailSection title="Background">
                    <DetailItem label="Previous Job" value={application.lastJob} />
                    <DetailItem label="Transport" value={application.transport} />
                    <DetailItem label="Equipment" value={application.equipment.join(', ')} />
                    <DetailItem label="Shirt Size" value={application.shirtSize} />
                    <DetailItem label="Police Record" value={application.policeRecord ? 'Yes' : 'No'} />
                </DetailSection>
            </div>
             <div className="space-y-4">
                <DetailSection title="Documents">
                    <div>
                        <p className="font-medium text-gray-600 mb-2">KTP (ID Card)</p>
                        <img src={`data:image/png;base64,${application.idCardImage}`} alt="ID Card" className="w-full rounded-lg border"/>
                    </div>
                     <div>
                        <p className="font-medium text-gray-600 mb-2">Profile Photo</p>
                        <img src={`data:image/png;base64,${application.profilePhotoImage}`} alt="Profile" className="w-40 h-40 object-cover rounded-lg border"/>
                    </div>
                </DetailSection>
             </div>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50" disabled={loading}>
            Close
          </button>
          {application.status === 'pending' && (
            <>
                <button onClick={() => onReject(application.id)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50" disabled={loading}>
                    {loading ? 'Processing...' : 'Reject'}
                </button>
                <button onClick={() => onApprove(application.id)} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50" disabled={loading}>
                    {loading ? 'Processing...' : 'Approve'}
                </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentApplicationDetailsModal;
