

import React, { useState, useEffect, useMemo } from 'react';
import { Partner, TourDestination } from '../../types';
import * as api from '../../services/supabase';
import { LandmarkIcon } from '../shared/Icons';

interface TourPricingProps {
  partner: Partner | null;
  onUpdate: (updatedData: Partial<Partner>) => Promise<void>;
}

const TourPricing: React.FC<TourPricingProps> = ({ partner, onUpdate }) => {
  const [destinations, setDestinations] = useState<TourDestination[]>([]);
  const [tourRates, setTourRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const data = await api.getTourDestinations();
        setDestinations(data);
      } catch (error) {
          console.error("Failed to fetch tour destinations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (partner) {
      setTourRates(partner.tourRates || {});
    }
  }, [partner]);

  const handleRateChange = (id: string, value: string) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      setTourRates(prev => ({ ...prev, [id]: numericValue }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({ tourRates });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const groupedDestinations = useMemo(() => {
    // Fix: Group destinations by category using a forEach loop for clearer type inference.
    const groups: { [key: string]: TourDestination[] } = {};
    destinations.forEach((dest) => {
      if (!groups[dest.category]) {
        groups[dest.category] = [];
      }
      groups[dest.category].push(dest);
    });
    return groups;
  }, [destinations]);

  if (loading) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">Loading tour destinations...</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <LandmarkIcon className="w-5 h-5 mr-2" />
                    Set Fixed Tour Prices
                </h4>
                <p className="text-xs text-gray-500">Prices are for a round trip (to and from location).</p>
            </div>
        </div>
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
            {/* FIX: Use Object.keys to iterate over grouped destinations. This provides better type safety than Object.entries with index signatures, resolving the issue where 'dests.map' would fail because 'dests' was inferred as 'unknown'. */}
            {Object.keys(groupedDestinations).map((category) => (
                 <div key={category} className="space-y-4 pt-4 border-t first:border-t-0 first:pt-0">
                    <h5 className="font-medium text-gray-700">{category}</h5>
                    {groupedDestinations[category].map(dest => (
                        <div key={dest.id}>
                            <label htmlFor={`tour-${dest.id}`} className="block text-sm font-medium text-gray-700">{dest.name}</label>
                            <p className="text-xs text-gray-500 mb-1">{dest.description}</p>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                </div>
                                <input
                                    type="number"
                                    id={`tour-${dest.id}`}
                                    className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-8 pr-4 py-2 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="0"
                                    value={tourRates[dest.id] || ''}
                                    onChange={(e) => handleRateChange(dest.id, e.target.value)}
                                    min={0}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
        <div className="mt-6">
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
            >
                {saving ? 'Saving...' : saved ? 'Tour Prices Saved!' : 'Save Tour Prices'}
            </button>
        </div>
    </div>
  );
};

export default TourPricing;
