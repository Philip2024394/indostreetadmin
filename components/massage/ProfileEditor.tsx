import React, { useState } from 'react';
import { Partner } from '../../types';
import { blobToBase64 } from '../shared/Editable';

interface ProfileEditorProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ partner, onUpdate }) => {
    const [bio, setBio] = useState(partner.bio || '');
    const [phone, setPhone] = useState(partner.phone || '');
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
        await onUpdate({
            bio,
            phone,
            profile: {
                ...partner.profile,
                profilePicture,
                headerPicture
            }
        });
        setSaving(false);
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
                        <label htmlFor="profile-pic-upload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
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
                     <label htmlFor="header-pic-upload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block">
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
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                            placeholder="81234567890"
                        />
                    </div>
                </div>
                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
            </div>
        </div>
    );
};

export default ProfileEditor;
