import React, { useState } from 'react';
import { Partner, HotelVillaAmenities } from '../../types';
import { ChevronLeftIcon } from '../shared/Icons';

interface AmenitiesEditorProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
    onBack: () => void;
}

type AmenityCategory = 'Guest Room' | 'Services' | 'Wellness' | 'Family' | 'Other';

const amenityConfig: Record<AmenityCategory, { key: keyof HotelVillaAmenities, label: string }[]> = {
    'Guest Room': [
        { key: 'wifi', label: 'Wi-Fi' },
        { key: 'tv', label: 'TV' },
        { key: 'airConditioning', label: 'Air Conditioning' },
        { key: 'kitchen', label: 'Kitchen/Kitchenette' },
    ],
    'Services': [
        { key: 'pool', label: 'Swimming Pool' },
        { key: 'restaurantBar', label: 'Restaurant / Bar' },
        { key: 'fitnessCenter', label: 'Fitness Center' },
        { key: 'parking', label: 'Parking' },
    ],
    'Wellness': [
        { key: 'spa', label: 'Spa' },
        { key: 'saunaSteamRoom', label: 'Sauna / Steam Room' },
        { key: 'yogaClasses', label: 'Yoga Classes' },
    ],
    'Family': [
        { key: 'kidsClub', label: 'Kids Club' },
        { key: 'babysitting', label: 'Babysitting Services' },
    ],
    'Other': [
        { key: 'petFriendly', label: 'Pet Friendly' },
        { key: 'shuttleService', label: 'Shuttle Service' },
    ],
};


const AmenitiesEditor: React.FC<AmenitiesEditorProps> = ({ partner, onUpdate, onBack }) => {
    const [amenities, setAmenities] = useState(partner.hotelVillaAmenities || {});
    const [saving, setSaving] = useState(false);

    const handleAmenityChange = (key: keyof HotelVillaAmenities, checked: boolean) => {
        setAmenities(prev => ({ ...prev, [key]: checked }));
    };

    const handleSave = async () => {
        setSaving(true);
        await onUpdate({ hotelVillaAmenities: amenities });
        setSaving(false);
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Dashboard
            </button>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800">Manage Amenities</h3>
                <p className="text-sm text-gray-500 mt-1">Select all the amenities and services your property offers.</p>

                <div className="mt-6 space-y-6">
                    {Object.entries(amenityConfig).map(([category, options]) => (
                        <div key={category}>
                            <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">{category}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                {options.map(({ key, label }) => (
                                    <div key={key} className="flex items-center">
                                        <input
                                            id={`amenity-${key}`}
                                            type="checkbox"
                                            checked={!!amenities[key]}
                                            onChange={(e) => handleAmenityChange(key, e.target.checked)}
                                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor={`amenity-${key}`} className="ml-2 block text-sm text-gray-900">{label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300"
                >
                    {saving ? 'Saving...' : 'Save Amenities'}
                </button>
            </div>
        </div>
    );
};

export default AmenitiesEditor;
