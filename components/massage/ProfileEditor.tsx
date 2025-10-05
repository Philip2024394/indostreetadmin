import React, { useState } from 'react';
import { Partner, PartnerType } from '../../types';
import { blobToBase64 } from '../shared/Editable';
import { WhatsAppIcon } from '../shared/Icons';

interface ProfileEditorProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ partner, onUpdate }) => {
    const [bio, setBio] = useState(partner.bio || '');
    const [phone, setPhone] = useState(partner.phone || '');
    const [address, setAddress] = useState(partner.address || '');
    const [street, setStreet] = useState(partner.street || '');
    const [saving, setSaving] = useState(false);
    
    // In a real app, this would be a URL from a file upload service. For this demo, we'll use base64.
    const [profilePicture, setProfilePicture] = useState(partner.profile.profilePicture || '');
    const [headerPicture, setHeaderPicture] = useState(partner.profile.headerPicture || '');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'header') => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await blobToBase64(file);
            const dataUrl = `data:${file.type};base64,${base64}`;
            if (type === 'profile') {
                setProfilePicture(dataUrl);
            } else {
                setHeaderPicture(dataUrl);
            }
        }
    };
    
    const handleSave = async () => {
        setSaving(true);
        const dataToUpdate: Partial<Partner> = {
            bio,
            phone,
            profile: {
                ...partner.profile,
                profilePicture,
                headerPicture
            }
        };

        if (partner.partnerType === PartnerType.MassagePlace) {
            dataToUpdate.address = address;
            dataToUpdate.street = street;
        }

        await onUpdate(dataToUpdate);
        setSaving(false);
    };

    const handleTestWhatsApp = () => {
        const adminTestNumber = '6281392000050'; // The user's number to receive the test
        const partnerNumber = phone;
        const message = `Hi, just testing my WhatsApp. My number is +${partnerNumber}`;
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${adminTestNumber}?text=${encodedMessage}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Your Profile</h3>
            <div className="space-y-6">
                 {/* Images */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (Logo)</label>
                    <div className="flex items-center space-x-4">
                        <img src={profilePicture} alt="Profile" className="w-20 h-20 rounded-full object-cover bg-gray-200" />
                        <label htmlFor="profile-pic-upload" className="cursor-pointer text-sm text-orange-600 hover:text-orange-800 font-medium">
                            Change
                            <input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Image (Banner)</label>
                    <div className="flex items-center space-x-4">
                         <img src={headerPicture} alt="Header" className="w-full h-24 rounded-md object-cover bg-gray-200" />
                    </div>
                     <label htmlFor="header-pic-upload" className="cursor-pointer text-sm text-orange-600 hover:text-orange-800 font-medium mt-2 inline-block">
                        Change Header
                        <input id="header-pic-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'header')} />
                    </label>
                </div>

                {/* Bio */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio / Description</label>
                    <textarea
                        id="bio"
                        rows={5}
                        maxLength={500}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="Describe your services, philosophy, and experience..."
                    />
                    <p className="text-right text-xs text-gray-500 mt-1">{bio.length}/500</p>
                </div>
                {/* Contact */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                     <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            +62
                        </span>
                        <input
                            type="tel"
                            id="phone"
                            value={phone.startsWith('62') ? phone.substring(2) : phone}
                            onChange={(e) => setPhone(`62${e.target.value.replace(/\D/g, '')}`)}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm border-gray-300"
                            placeholder="81234567890"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleTestWhatsApp}
                        className="mt-2 w-full flex justify-center items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md shadow-sm text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <WhatsAppIcon className="w-5 h-5 mr-2" />
                        Test WhatsApp Number
                    </button>
                </div>

                {/* Address for Massage Places */}
                {partner.partnerType === PartnerType.MassagePlace && (
                    <>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Area / City</label>
                            <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                placeholder="e.g., Jakarta Selatan"
                            />
                        </div>
                         <div>
                            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                            <input
                                type="text"
                                id="street"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                placeholder="e.g., Jl. Senopati No. 50"
                            />
                        </div>
                    </>
                )}


                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
                >
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
            </div>
        </div>
    );
};

export default ProfileEditor;