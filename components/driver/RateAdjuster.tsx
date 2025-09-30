import React, { useState, useEffect } from 'react';
import { Partner, PartnerType } from '../../types';
import { DollarSignIcon, BriefcaseIcon, ClockIcon, CalendarIcon } from '../shared/Icons';

interface RateAdjusterProps {
  partner: Partner | null;
  onUpdate: (updatedData: Partial<Partner>) => Promise<void>;
}

const RateInput: React.FC<{ label: string; value: number; onChange: (value: number) => void; placeholder?: string; min?: number, helpText?: string }> = ({ label, value, onChange, placeholder, min, helpText }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
                type="number"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 pr-4 py-2 sm:text-sm border-gray-300 rounded-md"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
            />
        </div>
        {helpText && <p className="mt-2 text-xs text-gray-500">{helpText}</p>}
    </div>
);


const RateAdjuster: React.FC<RateAdjusterProps> = ({ partner, onUpdate }) => {
  const isCar = partner?.partnerType === PartnerType.CarDriver;

  const govStandards = {
    car: { minRatePerKm: 3500, minFare: 15200 },
    bike: { minRatePerKm: 2600, minFare: 8000 },
  };
  const standards = isCar ? govStandards.car : govStandards.bike;

  const [rideRatePerKm, setRideRatePerKm] = useState(0);
  const [minFare, setMinFare] = useState(0);
  const [parcelRatePerKm, setParcelRatePerKm] = useState(0);
  const [hourlyHireRate, setHourlyHireRate] = useState(0);
  const [dailyHireRate, setDailyHireRate] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partner) {
      setRideRatePerKm(partner.rideRatePerKm || standards.minRatePerKm);
      setMinFare(partner.minFare || standards.minFare);
      setParcelRatePerKm(partner.parcelRatePerKm || 0);
      setHourlyHireRate(partner.hourlyHireRate || 0);
      setDailyHireRate(partner.dailyHireRate || 0);
    }
  }, [partner]);

  const handleSave = async () => {
    if (rideRatePerKm < standards.minRatePerKm || minFare < standards.minFare) {
      alert("Your ride-hailing rates cannot be below the government minimum.");
      return;
    }
    setLoading(true);

    await onUpdate({
      rideRatePerKm,
      minFare,
      parcelRatePerKm,
      hourlyHireRate,
      dailyHireRate
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  if (!partner) {
      return (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500">Loading rate settings...</p>
          </div>
      );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Set Your Rates</h4>
      <div className="space-y-6">
        {/* Ride Hailing Section */}
        <div className="space-y-4 pt-4 border-t">
          <h5 className="font-medium text-gray-700 flex items-center"><DollarSignIcon className="w-5 h-5 mr-2" />Ride Hailing</h5>
          <RateInput 
            label="Your Rate per Kilometer"
            value={rideRatePerKm}
            onChange={setRideRatePerKm}
            min={standards.minRatePerKm}
            helpText={`Government minimum: Rp ${standards.minRatePerKm.toLocaleString('id-ID')}`}
          />
          <RateInput
            label="Minimum Fare (Flag Fall)"
            value={minFare}
            onChange={setMinFare}
            min={standards.minFare}
            helpText={`Minimum for the first 4km: Rp ${standards.minFare.toLocaleString('id-ID')}`}
          />
        </div>

        {/* Parcel Delivery Section */}
        <div className="space-y-4 pt-4 border-t">
          <h5 className="font-medium text-gray-700 flex items-center"><BriefcaseIcon className="w-5 h-5 mr-2" />Parcel Delivery</h5>
          <RateInput
            label="Rate per Kilometer (Parcels)"
            value={parcelRatePerKm}
            onChange={setParcelRatePerKm}
            helpText="Set your price for delivering packages."
          />
        </div>

        {/* Private Hire Section */}
        <div className="space-y-4 pt-4 border-t">
          <h5 className="font-medium text-gray-700 flex items-center"><ClockIcon className="w-5 h-5 mr-2" />Private Hire</h5>
          <RateInput
            label="Hourly Rate"
            value={hourlyHireRate}
            onChange={setHourlyHireRate}
            helpText="Rate for users hiring you by the hour."
          />
           <RateInput
            label="Daily Rate (8 hours)"
            value={dailyHireRate}
            onChange={setDailyHireRate}
            helpText="Rate for users hiring you for a full day."
          />
        </div>

        <div>
            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
                {loading ? 'Saving...' : saved ? 'Rates Saved!' : 'Save All Rates'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default RateAdjuster;