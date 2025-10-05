import React, { useState, useRef, useEffect } from 'react';
import { Partner } from '../../types';
import { MapPinIcon, PencilIcon } from '../shared/Icons';

declare global {
  interface Window {
    google: any;
  }
}

interface LocationControlProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
}

const LocationControl: React.FC<LocationControlProps> = ({ partner, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const autocompleteInput = useRef<HTMLInputElement>(null);
    const autocomplete = useRef<any>(null);

    // Setup Google Maps Autocomplete
    useEffect(() => {
        if (isEditing && autocompleteInput.current && window.google) {
            autocomplete.current = new window.google.maps.places.Autocomplete(
                autocompleteInput.current,
                {
                    componentRestrictions: { country: "id" }, // Restrict to Indonesia
                    fields: ["formatted_address", "geometry", "name"],
                }
            );
            autocomplete.current.addListener("place_changed", handlePlaceSelect);
        }
        // Cleanup listener
        return () => {
            if (autocomplete.current) {
                window.google.maps.event.clearInstanceListeners(autocomplete.current);
            }
        };
    }, [isEditing]);

    const handlePlaceSelect = () => {
        const place = autocomplete.current.getPlace();
        if (place && place.geometry) {
            const newLocation = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address,
            };
            onUpdate({ location: newLocation });
            setIsEditing(false);
            setError('');
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setLoading(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                if (!window.google) {
                     setError('Google Maps is not available.');
                     setLoading(false);
                     return;
                }
                
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: any) => {
                    if (status === 'OK' && results[0]) {
                        onUpdate({
                            location: {
                                lat: latitude,
                                lng: longitude,
                                address: results[0].formatted_address,
                            }
                        });
                    } else {
                        setError('Could not determine address from your location.');
                    }
                    setLoading(false);
                });
            },
            (err) => {
                if (err.code === 1) {
                    setError('Location permission denied. Please enable it in your browser settings.');
                } else {
                    setError('Unable to retrieve your location.');
                }
                setLoading(false);
            }
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">My Current Location</h3>
            <p className="text-sm text-gray-500 mb-4">This is shown to customers to calculate distance. Keep it updated for accurate requests.</p>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            
            <div className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
                <div className="flex items-center min-w-0">
                    <MapPinIcon className="w-6 h-6 mr-3 text-gray-500 flex-shrink-0" />
                    <span className="font-medium text-gray-800 truncate">
                        {partner.location?.address || 'Location not set'}
                    </span>
                </div>
                 {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex-shrink-0 ml-4 flex items-center text-sm font-medium text-orange-600 hover:text-orange-800">
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                    </button>
                )}
            </div>

            {isEditing && (
                <div className="mt-4">
                    <input
                        ref={autocompleteInput}
                        type="text"
                        placeholder="Start typing your address..."
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        autoFocus
                    />
                     <button onClick={() => setIsEditing(false)} className="mt-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                </div>
            )}

            <div className="mt-4">
                <button
                    onClick={handleUseMyLocation}
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300"
                >
                    {loading ? 'Getting location...' : 'Use My Phone Location'}
                </button>
            </div>
        </div>
    );
};

export default LocationControl;