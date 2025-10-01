import React, { useState, useEffect } from 'react';
import { Partner } from '../../types';
import { ChevronLeftIcon } from '../shared/Icons';
import PhotoGalleryManager from './PhotoGalleryManager';
import { blobToBase64 } from '../shared/Editable';
import ToggleSwitch from '../shared/ToggleSwitch';

interface PropertyProfileEditorProps {
  partner: Partner;
  onUpdate: (data: Partial<Partner>) => Promise<void>;
  onBack: () => void;
}

const PropertyProfileEditor: React.FC<PropertyProfileEditorProps> = ({ partner, onUpdate, onBack }) => {
  const [formData, setFormData] = useState({
    name: partner.profile.name || '',
    bio: partner.bio || '',
    description: partner.description || '',
    address: partner.address || '',
    street: partner.street || '',
    checkInTime: partner.checkInTime || '14:00',
    airportPickup: partner.airportPickup || false,
    whatsapp: partner.phone || '',
    loyaltyRewardEnabled: partner.loyaltyRewardEnabled || false,
  });
  const [logo, setLogo] = useState(partner.profile.profilePicture || '');
  const [headerImage, setHeaderImage] = useState(partner.profile.headerPicture || '');
  const [photos, setPhotos] = useState(partner.photos || []);

  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleToggle = (name: 'airportPickup' | 'loyaltyRewardEnabled', value: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'header') => {
      const file = e.target.files?.[0];
      if (file) {
          const base64 = await blobToBase64(file);
          const dataUrl = `data:${file.type};base64,${base64}`;
          if (type === 'logo') setLogo(dataUrl);
          else setHeaderImage(dataUrl);
      }
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({
      ...formData,
      phone: formData.whatsapp,
      photos,
      profile: {
        ...partner.profile,
        name: formData.name,
        profilePicture: logo,
        headerPicture: headerImage,
      },
    });
    setSaving(false);
  };
  
  return (
    <div className="space-y-6">
       <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-2">
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Back to Dashboard
      </button>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Property Name" name="name" value={formData.name} onChange={handleChange} />
          <InputField label="Tagline / Slogan" name="bio" value={formData.bio} onChange={handleChange} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 sm:text-sm" />
          </div>
        </div>
      </div>
      
       <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="City / Region" name="address" value={formData.address} onChange={handleChange} placeholder="e.g., Ubud"/>
            <InputField label="Street Name" name="street" value={formData.street} onChange={handleChange} />
        </div>
       </div>

       <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Branding & Media</h3>
        <div className="space-y-6">
            <ImageUploader label="Logo (1:1 Ratio)" currentImage={logo} onFileChange={e => handleFileChange(e, 'logo')} />
            <ImageUploader label="Header Image (4:1 Ratio)" currentImage={headerImage} onFileChange={e => handleFileChange(e, 'header')} />
            <PhotoGalleryManager photos={photos} setPhotos={setPhotos} />
        </div>
       </div>

       <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Operations & Guest Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Check-In Time" name="checkInTime" value={formData.checkInTime} onChange={handleChange} type="time" />
            <InputField label="WhatsApp Number" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+62..." />
            <ToggleSwitchField label="Airport Pickup Available" enabled={formData.airportPickup} onChange={(val) => handleToggle('airportPickup', val)} />
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 md:col-span-2">
                <ToggleSwitchField 
                    label="Activate Guest Rewards Program" 
                    enabled={formData.loyaltyRewardEnabled} 
                    onChange={(val) => handleToggle('loyaltyRewardEnabled', val)} 
                />
                <p className="text-xs text-blue-800 mt-2">Offer IndoStreet users a 5% discount on all their food and taxi orders for 48 hours after booking with you. This significantly increases your property's visibility and appeal.</p>
            </div>
        </div>
       </div>

       <div className="flex justify-end mt-4">
        <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
            {saving ? 'Saving...' : 'Save All Changes'}
        </button>
       </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: any) => void; type?: string; placeholder?: string; }> = ({ label, name, value, onChange, type = 'text', placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 sm:text-sm" />
    </div>
);

const ImageUploader: React.FC<{ label: string; currentImage: string; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, currentImage, onFileChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex items-center space-x-4">
            <img src={currentImage || 'https://via.placeholder.com/100'} alt={label} className="h-16 w-16 object-cover rounded-md bg-gray-100" />
             <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                Change
                <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </label>
        </div>
    </div>
);

const ToggleSwitchField: React.FC<{label: string; enabled: boolean; onChange: (enabled: boolean) => void;}> = ({ label, enabled, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-2">
            <ToggleSwitch enabled={enabled} onChange={onChange} />
        </div>
    </div>
);

export default PropertyProfileEditor;
