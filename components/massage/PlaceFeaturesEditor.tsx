import React, { useState } from 'react';
import { Partner } from '../../types';
import { XIcon } from '../shared/Icons';
import { blobToBase64 } from '../shared/Editable';

interface PlaceFeaturesEditorProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
}

const PlaceFeaturesEditor: React.FC<PlaceFeaturesEditorProps> = ({ partner, onUpdate }) => {
    const [galleryImages, setGalleryImages] = useState(partner.galleryImages || []);
    const [amenities, setAmenities] = useState(partner.amenities || {});
    const [businessHours, setBusinessHours] = useState(partner.businessHours || '');
    const [saving, setSaving] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (galleryImages.length >= 3) {
            alert("You can upload a maximum of 3 gallery images.");
            return;
        }
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await blobToBase64(file);
            const dataUrl = `data:${file.type};base64,${base64}`;
            setGalleryImages(prev => [...prev, dataUrl]);
        }
    };
    
    const handleRemoveImage = (imageToRemove: string) => {
        setGalleryImages(galleryImages.filter(img => img !== imageToRemove));
    };

    const handleAmenityChange = (amenity: keyof NonNullable<Partner['amenities']>, checked: boolean) => {
        setAmenities(prev => ({...prev, [amenity]: checked}));
    };
    
    const handleSave = async () => {
        setSaving(true);
        await onUpdate({
            galleryImages,
            amenities,
            businessHours,
        });
        setSaving(false);
    };
    
    const amenityOptions: { key: keyof NonNullable<Partner['amenities']>, label: string }[] = [
        { key: 'sauna', label: 'Sauna' },
        { key: 'jacuzzi', label: 'Jacuzzi' },
        { key: 'salon', label: 'Salon' },
        { key: 'nailArt', label: 'Nail Art' },
        { key: 'steamRoom', label: 'Steam Room' },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Spa / Place Features</h3>
            <div className="space-y-6">
                {/* Photo Gallery */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Photo Gallery (up to 3 images)</label>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                        {galleryImages.map((img, index) => (
                            <div key={index} className="relative group">
                                <img src={img} alt={`Gallery ${index+1}`} className="w-full h-24 object-cover rounded-md" />
                                <button
                                    onClick={() => handleRemoveImage(img)}
                                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                     {galleryImages.length < 3 && (
                        <label htmlFor="gallery-upload" className="mt-2 inline-block cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                            + Add Photo
                            <input id="gallery-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                     )}
                </div>

                {/* Amenities */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Other Available Services</label>
                    <div className="mt-2 space-y-2">
                        {amenityOptions.map(({ key, label }) => (
                            <div key={key} className="flex items-center">
                                <input
                                    id={`amenity-${key}`}
                                    type="checkbox"
                                    checked={!!amenities[key]}
                                    onChange={(e) => handleAmenityChange(key, e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`amenity-${key}`} className="ml-2 block text-sm text-gray-900">{label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Business Hours */}
                <div>
                    <label htmlFor="business-hours" className="block text-sm font-medium text-gray-700">Business Hours</label>
                    <input
                        type="text"
                        id="business-hours"
                        value={businessHours}
                        onChange={(e) => setBusinessHours(e.target.value)}
                        placeholder="e.g., 10:00 AM - 9:00 PM Daily"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                    />
                </div>
                
                 {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {saving ? 'Saving...' : 'Save Place Features'}
                </button>
            </div>
        </div>
    );
};

export default PlaceFeaturesEditor;
