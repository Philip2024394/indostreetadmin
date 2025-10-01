import React from 'react';
import { MotorcycleIcon, RealCarIcon, TruckIcon, CubeIcon } from '../shared/Icons';

const GuideItem: React.FC<{ icon: React.ReactNode; title: string; dimensions: string; weight: string }> = ({ icon, title, dimensions, weight }) => (
    <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-blue-600 mt-1">{icon}</div>
        <div>
            <p className="font-semibold text-gray-800">{title}</p>
            <p className="text-sm text-gray-600">Max Dimensions: <span className="font-medium">{dimensions}</span></p>
            <p className="text-sm text-gray-600">Max Weight: <span className="font-medium">{weight}</span></p>
        </div>
    </div>
);

const WeightsDimensionsGuide: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <CubeIcon className="w-5 h-5 mr-2" />
        Weights & Dimensions Guide
      </h4>
      <div className="space-y-4">
        <GuideItem
            icon={<MotorcycleIcon className="w-6 h-6" />}
            title="Bike Delivery"
            dimensions="40 x 40 x 40 cm"
            weight="20 kg"
        />
        <GuideItem
            icon={<RealCarIcon className="w-6 h-6" />}
            title="Car Delivery"
            dimensions="100 x 60 x 50 cm"
            weight="100 kg"
        />
        <GuideItem
            icon={<TruckIcon className="w-6 h-6" />}
            title="Lorry / Box Truck"
            dimensions="200 x 150 x 120 cm"
            weight="750 kg"
        />
      </div>
    </div>
  );
};

export default WeightsDimensionsGuide;
