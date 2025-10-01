import React, { useState, useEffect } from 'react';
import { Partner } from '../../types';
import { PencilIcon, DevicePhoneMobileIcon, BanknotesIcon } from './Icons';

interface ProfileManagementProps {
  partner: Partner | null;
  onUpdate: (updatedData: Partial<Partner>) => Promise<void>;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ partner, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (partner) {
      setFormData({
        phone: partner.phone || '',
        bankName: partner.bankDetails?.bankName || '',
        accountHolderName: partner.bankDetails?.accountHolderName || '',
        accountNumber: partner.bankDetails?.accountNumber || '',
      });
    }
  }, [partner]);

  if (!partner) {
    return <div className="bg-white p-6 rounded-lg shadow-md animate-pulse"><div className="h-20 bg-gray-200 rounded w-full"></div></div>;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    await onUpdate({
        phone: formData.phone,
        bankDetails: {
            bankName: formData.bankName,
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
        }
    });
    setIsLoading(false);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    // Reset form data to original partner data
    if (partner) {
      setFormData({
        phone: partner.phone || '',
        bankName: partner.bankDetails?.bankName || '',
        accountHolderName: partner.bankDetails?.accountHolderName || '',
        accountNumber: partner.bankDetails?.accountNumber || '',
      });
    }
    setIsEditing(false);
  };

  const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-gray-800">{value || '-'}</p>
    </div>
  );

  const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <img 
                        src={partner.profile.profilePicture || `https://ui-avatars.com/api/?name=${partner.profile.name || partner.profile.shopName}&background=random`}
                        alt={partner.profile.name || partner.profile.shopName || 'Partner'} 
                        className="w-20 h-20 rounded-full border-4 border-gray-200"
                    />
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{partner.profile.name || partner.profile.shopName}</h3>
                        <p className="text-sm text-gray-500">{partner.email}</p>
                    </div>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                    </button>
                )}
            </div>
            <div className="mt-6 space-y-6">
                 {/* Contact Information */}
                <div>
                    <h4 className="font-semibold text-gray-700 flex items-center mb-2 text-sm uppercase tracking-wide">
                        <DevicePhoneMobileIcon className="w-5 h-5 mr-2" /> Contact &amp; Payout Info
                    </h4>
                    <div className="space-y-4 pl-7">
                        {isEditing ? (
                            <>
                                <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} />
                                <h5 className="font-semibold text-gray-700 flex items-center pt-2 text-sm uppercase tracking-wide"><BanknotesIcon className="w-5 h-5 mr-2" /> Bank Details</h5>
                                <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleInputChange} />
                                <InputField label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} />
                                <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} />
                            </>
                        ) : (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoRow label="Phone Number" value={partner.phone} />
                                <InfoRow label="Bank Name" value={partner.bankDetails?.bankName} />
                                <InfoRow label="Account Holder" value={partner.bankDetails?.accountHolderName} />
                                <InfoRow label="Account Number" value={partner.bankDetails?.accountNumber} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default ProfileManagement;
