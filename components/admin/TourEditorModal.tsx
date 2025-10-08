

import React, { useState, useEffect, useRef } from 'react';
import { TourDestination } from '../../types';
import { XIcon } from '../shared/Icons';
import { blobToBase64 } from '../shared/Editable';

declare global {
  interface Window {
    google: any;
  }
}

interface TourEditorModalProps {
  destination: TourDestination | null;
  onClose: () => void;
  onSave: (data: Omit<TourDestination, 'id'>) => void;
}

const categories = [
    'Temples & Historical Sites',
    'Nature & Outdoors',
    'Culture & Art'
] as const;

const TourEditorModal: React.FC<TourEditorModalProps> = ({ destination, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<TourDestination['category']>(categories[0]);
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [touristInfo, setTouristInfo] = useState({
        food: '',
        toilets: '',
        childSafety: '',
        guideNeeded: '',
        insectRisk: '',
        openingHours: '',
    });
    const [location, setLocation] = useState<TourDestination['location'] | undefined>(undefined);
    const [addressString, setAddressString] = useState('');

    const autocompleteInput = useRef<HTMLInputElement>(null);
    const autocomplete = useRef<any>(null);

    useEffect(() => {
        if (destination) {
            setName(destination.name);
            setCategory(destination.category);
            setDescription(destination.description);
            setImageUrl(destination.imageUrl || '');
            setTouristInfo(destination.touristInfo || {
                food: '', toilets: '', childSafety: '', guideNeeded: '', insectRisk: '', openingHours: '',
            });
            setLocation(destination.location);
            setAddressString(destination.location?.address || '');
        } else {
            // Reset for new entry
            setName('');
            setCategory(categories[0]);
            setDescription('');
            setImageUrl('');
            setTouristInfo({ food: '', toilets: '', childSafety: '', guideNeeded: '', insectRisk: '', openingHours: '' });
            setLocation(undefined);
            setAddressString('');
        }
    }, [destination]);
    
    useEffect(() => {
        if (!window.google || !autocompleteInput.current) {
            return;
        }

        autocomplete.current = new window.google.maps.places.Autocomplete(
            autocompleteInput.current,
            {
                componentRestrictions: { country: "id" },
                fields: ["formatted_address", "geometry", "name"],
            }
        );

        autocomplete.current.addListener("place_changed", handlePlaceSelect);

        return () => {
            if (autocomplete.current) {
                window.google.maps.event.clearInstanceListeners(autocomplete.current);
            }
        };
    }, []);

    const handlePlaceSelect = () => {
        const place = autocomplete.current.getPlace();
        if (place && place.geometry) {
            const newLocation = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address,
            };
            setLocation(newLocation);
            setAddressString(newLocation.address);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !imageUrl) {
            alert('Please fill out name, description, and image.');
            return;
        }
        onSave({ name, category, description, imageUrl, touristInfo, location });
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const dataUrl = `data:${file.type};base64,${await blobToBase64(file)}`;
            setImageUrl(dataUrl);
        }
    };
    
    const handleTouristInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouristInfo(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">{destination ? 'Edit Destination' : 'Add New Destination'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="dest-name" className="block text-sm font-medium text-gray-700">Destination Name</label>
                            <input type="text" id="dest-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="dest-category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select id="dest-category" value={category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as TourDestination['category'])} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dest-location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input
                                ref={autocompleteInput}
                                type="text"
                                id="dest-location"
                                placeholder="Start typing an address..."
                                value={addressString}
                                onChange={(e) => setAddressString(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            />
                        </div>
                         <div>
                            <label htmlFor="dest-description" className="block text-sm font-medium text-gray-700">Bio / Description</label>
                            <textarea id="dest-description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="dest-image-url" className="block text-sm font-medium text-gray-700">Image</label>
                            <div className="mt-1">
                                <input
                                    id="dest-image-url"
                                    type="text"
                                    placeholder="Enter image URL"
                                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                />
                            </div>
                            <div className="mt-2 text-center text-xs text-gray-500">OR</div>
                            <div className="mt-2">
                                <label className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-orange-500">
                                    <div className="space-y-1 text-center">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="Preview" className="mx-auto h-24 max-h-24 w-auto object-contain" />
                                        ) : (
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative bg-white rounded-md font-medium text-orange-600 hover:text-orange-500">
                                                <span>Upload a file</span>
                                                <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <fieldset className="border p-4 rounded-md mt-4">
                            <legend className="px-2 font-semibold text-gray-700 text-sm">Tourist Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <InputField label="Food Availability" name="food" value={touristInfo.food} onChange={handleTouristInfoChange} placeholder="e.g., Many restaurants nearby" />
                                <InputField label="Toilets" name="toilets" value={touristInfo.toilets} onChange={handleTouristInfoChange} placeholder="e.g., Yes / Basic facilities" />
                                <InputField label="Child Safety" name="childSafety" value={touristInfo.childSafety} onChange={handleTouristInfoChange} placeholder="e.g., Yes, but supervision needed" />
                                <InputField label="Guide Needed?" name="guideNeeded" value={touristInfo.guideNeeded} onChange={handleTouristInfoChange} placeholder="e.g., Recommended" />
                                <InputField label="Insect Risk" name="insectRisk" value={touristInfo.insectRisk} onChange={handleTouristInfoChange} placeholder="e.g., Moderate. Repellent advised." />
                                <InputField label="Opening Hours" name="openingHours" value={touristInfo.openingHours} onChange={handleTouristInfoChange} placeholder="e.g., 7:30 AM - 5:00 PM" />
                            </div>
                        </fieldset>
                    </div>
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">Save Destination</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string }> = 
({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            type="text" 
            id={name} 
            name={name} 
            value={value || ''} 
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
    </div>
);

export default TourEditorModal;