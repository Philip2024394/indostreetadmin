import React, { useState, useEffect } from 'react';
import { Partner } from '../../types';
import { KeyIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

interface VehicleRentalManagementProps {
  partner: Partner | null;
  onUpdate: (updatedData: Partial<Partner>) => Promise<void>;
}

const RateInput: React.FC<{ label: string; value: number; onChange: (value: number) => void; disabled: boolean; }> = ({ label, value, onChange, disabled }) => (
    <div>
        <label className={`block text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className={`${disabled ? 'text-gray-400' : 'text-gray-500'} sm:text-sm`}>Rp</span>
            </div>
            <input
                type="number"
                className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-8 pr-4 py-2 sm:text-sm border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={0}
                disabled={disabled}
            />
        </div>
    </div>
);

const VehicleRentalManagement: React.FC<VehicleRentalManagementProps> = ({ partner, onUpdate }) => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [dailyRate, setDailyRate] = useState(0);
    const [weeklyRate, setWeeklyRate] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (partner && partner.rentalDetails) {
            setIsAvailable(partner.rentalDetails.isAvailableForRental);
            setDailyRate(partner.rentalDetails.dailyRate || 0);
            setWeeklyRate(partner.rentalDetails.weeklyRate || 0);
        } else if (partner) {
            // Default to off if no details exist
            setIsAvailable(false);
            setDailyRate(0);
            setWeeklyRate(0);
        }
    }, [partner]);
    
    const handleSave = async () => {
        setLoading(true);
        await onUpdate({
            rentalDetails: {
                isAvailableForRental: isAvailable,
                dailyRate: dailyRate,
                weeklyRate: weeklyRate
            }
        });
        setLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };
    
    if (!partner) {
        return (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500">Loading rental settings...</p>
          </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center"><KeyIcon className="w-5 h-5 mr-2" /> List Vehicle for Rental</h4>
            <p className="text-sm text-gray-500 mb-4">Earn extra by renting out your vehicle when you're not driving.</p>

            <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <ToggleSwitch
                        enabled={isAvailable}
                        onChange={setIsAvailable}
                        enabledText="Vehicle is listed for rent"
                        disabledText="Vehicle is not for rent"
                    />
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <RateInput 
                        label="Price per Day"
                        value={dailyRate}
                        onChange={setDailyRate}
                        disabled={!isAvailable}
                    />
                    <RateInput 
                        label="Price per Week (7 days)"
                        value={weeklyRate}
                        onChange={setWeeklyRate}
                        disabled={!isAvailable}
                    />
                </div>
                 <div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
                    >
                        {loading ? 'Saving...' : saved ? 'Rental Settings Saved!' : 'Save Rental Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VehicleRentalManagement;
