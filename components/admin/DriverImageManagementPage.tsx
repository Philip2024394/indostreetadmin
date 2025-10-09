import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/supabase';
import { VehicleImageSet } from '../../types';
import { MotorcycleIcon, RealCarIcon, TruckIcon } from '../shared/Icons';

// A specialized input component for managing image URLs.
const ImageUrlInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      <div className="mt-1 flex items-center space-x-2">
        <input 
          type="url" 
          value={value} 
          onChange={handleChange} 
          placeholder="https://..." 
          className="flex-grow block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
        />
        {value ? (
          <img 
            src={value} 
            alt="Preview" 
            className="w-10 h-10 object-contain rounded-md border bg-gray-100" 
            // Display a placeholder on image load error
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/f8f8f8/c0c0c0?text=Error'; }} 
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-md border bg-gray-100 text-gray-400 text-xs">
            N/A
          </div>
        )}
      </div>
    </div>
  );
};

// A reusable section for managing images for a specific vehicle type.
const VehicleTypeImageSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  images: VehicleImageSet;
  onImageChange: (status: keyof Omit<VehicleImageSet, 'id'>, value: string) => void;
}> = ({ title, icon, images, onImageChange }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="bg-gray-100 p-2 rounded-full mr-3">{icon}</div>
        <h4 className="font-bold text-lg text-gray-800">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-4">
        <ImageUrlInput label="Searching URL" value={images.searching || ''} onChange={(val) => onImageChange('searching', val)} />
        <ImageUrlInput label="On The Way URL" value={images.on_the_way || ''} onChange={(val) => onImageChange('on_the_way', val)} />
        <ImageUrlInput label="Arrived URL" value={images.arrived || ''} onChange={(val) => onImageChange('arrived', val)} />
        <ImageUrlInput label="Completed URL" value={images.completed || ''} onChange={(val) => onImageChange('completed', val)} />
      </div>
    </div>
  );
};

// The main page component, now structured by vehicle type.
const DriverImageManagementPage: React.FC = () => {
    const [bikeImages, setBikeImages] = useState<VehicleImageSet>({});
    const [carImages, setCarImages] = useState<VehicleImageSet>({});
    const [truckImages, setTruckImages] = useState<VehicleImageSet>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [bikeData, carData, truckData] = await Promise.all([
                api.getBikeImages(),
                api.getCarImages(),
                api.getTruckImages(),
            ]);
            setBikeImages(bikeData);
            setCarImages(carData);
            setTruckImages(truckData);
        } catch (err: any) {
            setError('Failed to load driver images. Please ensure the bikeimages, carimages, and truckimages tables exist and have RLS policies set up. You can find the required SQL on the "Database Setup" page.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleImageChange = (
        vehicleType: 'bike' | 'car' | 'truck',
        status: keyof Omit<VehicleImageSet, 'id'>,
        value: string
    ) => {
        // This function handles both optimistic UI update and API call.
        if (vehicleType === 'bike') {
            const updated = { ...bikeImages, [status]: value };
            setBikeImages(updated);
            const { id, ...updateData } = updated;
            api.updateBikeImages(updateData).catch(err => {
                console.error("Failed to save bike image:", err);
                setError("Failed to save bike image. Check console for details.");
            });
        } else if (vehicleType === 'car') {
            const updated = { ...carImages, [status]: value };
            setCarImages(updated);
            const { id, ...updateData } = updated;
            api.updateCarImages(updateData).catch(err => {
                 console.error("Failed to save car image:", err);
                 setError("Failed to save car image. Check console for details.");
            });
        } else if (vehicleType === 'truck') {
            const updated = { ...truckImages, [status]: value };
            setTruckImages(updated);
            const { id, ...updateData } = updated;
            api.updateTruckImages(updateData).catch(err => {
                 console.error("Failed to save truck image:", err);
                 setError("Failed to save truck image. Check console for details.");
            });
        }
    };

    if (loading) {
        return <p>Loading image settings...</p>;
    }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Manage the default status-based images shown to users for each vehicle type. The user-facing application will use these images based on the driver's vehicle. If a URL is left blank, a default fallback will be used.
      </p>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
      
      <VehicleTypeImageSection 
        title="Bike Images" 
        icon={<MotorcycleIcon className="w-6 h-6 text-gray-600" />} 
        images={bikeImages}
        onImageChange={(status, value) => handleImageChange('bike', status, value)}
      />
      <VehicleTypeImageSection 
        title="Car Images" 
        icon={<RealCarIcon className="w-6 h-6 text-gray-600" />} 
        images={carImages}
        onImageChange={(status, value) => handleImageChange('car', status, value)}
      />
      <VehicleTypeImageSection 
        title="Truck Images" 
        icon={<TruckIcon className="w-6 h-6 text-gray-600" />} 
        images={truckImages}
        onImageChange={(status, value) => handleImageChange('truck', status, value)}
      />
    </div>
  );
};

export default DriverImageManagementPage;