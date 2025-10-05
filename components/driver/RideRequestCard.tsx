import React, { useState, useRef, useEffect } from 'react';
import { RideRequest } from '../../types';
import { MapPinIcon, StarIcon, CheckIcon, XIcon, DollarSignIcon, UserCircleIcon } from '../shared/Icons';

declare global {
    interface Window {
        google: any;
    }
}

interface RideRequestCardProps {
    request: RideRequest;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}

const RideRequestCard: React.FC<RideRequestCardProps> = ({ request, onAccept, onReject }) => {
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMap || !mapRef.current || !window.google) {
        return;
    }

    const map = new window.google.maps.Map(mapRef.current!, {
        center: { lat: -6.2088, lng: 106.8456 }, // Default to Jakarta
        zoom: 12,
        disableDefaultUI: true,
    });
    
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({ map });

    directionsService.route(
        {
            origin: request.pickupLocation,
            destination: request.destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
            } else {
                console.error(`Directions request failed due to ${status}`);
                // Fallback to geocoding if directions fail
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ address: request.pickupLocation }, (results, status) => {
                    if (status === 'OK') {
                        new window.google.maps.Marker({ position: results[0].geometry.location, map, label: 'A' });
                    }
                });
                geocoder.geocode({ address: request.destination }, (results, status) => {
                    if (status === 'OK') {
                        new window.google.maps.Marker({ position: results[0].geometry.location, map, label: 'B' });
                    }
                });
            }
        }
    );

  }, [showMap, request.pickupLocation, request.destination]);


  return (
    <div className="bg-gray-50 border rounded-lg shadow-sm p-4 animate-fade-in">
        <div className="flex justify-between items-start">
            <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                    <MapPinIcon className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                    <span className="font-medium">{request.pickupLocation}</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <MapPinIcon className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" />
                    <span className="font-medium">{request.destination}</span>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <p className="text-2xl font-bold text-gray-800">
                    Rp {request.fare.toLocaleString('id-ID')}
                </p>
                <div className="flex items-center justify-end text-sm text-gray-500 mt-1">
                    <UserCircleIcon className="w-4 h-4 mr-1"/>
                    <span>{request.customerName}</span>
                    <StarIcon className="w-4 h-4 ml-2 mr-1 text-yellow-400 fill-current" />
                    <span>{request.customerRating.toFixed(1)}</span>
                </div>
            </div>
        </div>

        {showMap && (
            <div ref={mapRef} className="mt-4 h-48 w-full rounded-lg" />
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
             <button
                onClick={() => onAccept(request.id)}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                <CheckIcon className="w-5 h-5 mr-2"/>
                Accept
            </button>
             <button
                onClick={() => onReject(request.id)}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                <XIcon className="w-5 h-5 mr-2"/>
                Reject
            </button>
             <button
                onClick={() => setShowMap(!showMap)}
                className="flex-shrink-0 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
                <MapPinIcon className="w-5 h-5 mr-2"/>
                {showMap ? 'Hide Map' : 'Show Map'}
            </button>
        </div>
    </div>
  );
};

export default RideRequestCard;