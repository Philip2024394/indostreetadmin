import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, Zone } from '../../types';
import { XIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

interface BikeDriverFormModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (data: Omit<Vehicle, 'id'>, id?: string) => void;
}

const minPrices: Record<Zone, number> = {
    [Zone.Zone1]: 1850,
    [Zone.Zone2]: 2600,
    [Zone.Zone3]: 2100,
};

const defaultFormData: Omit<Vehicle, 'id'> = {
    type: 'Bike',
    serviceType: 'ride',
    driver: '',
    driverImage: '',
    driverRating: 4.5,
    name: '',
    plate: '',
    isAvailable: true,
    zone: Zone.Zone1,
    pricePerKm: minPrices[Zone.Zone1],
    pricePerKmParcel: minPrices[Zone.Zone1],
    whatsapp: '',
    modelCc: '',
    color: '',
    registrationYear: new Date().getFullYear(),
    pricePerDay: 0,
    bankDetails: {
        bankName: '',
        accountHolder: '',
        accountNumber: '',
    },
};

const BikeDriverFormModal: React.FC<BikeDriverFormModalProps> = ({ vehicle, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>(defaultFormData);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    useEffect(() => {
        if (vehicle) {
            setFormData({
                ...defaultFormData,
                ...vehicle,
                pricePerDay: vehicle.pricePerDay ?? 0,
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [vehicle]);

    const isFormValid = useMemo(() => {
        const requiredFields: (keyof Omit<Vehicle, 'id'>)[] = ['driver', 'driverImage', 'driverRating', 'name', 'plate', 'zone', 'pricePerKm', 'pricePerKmParcel'];
        
        for (const field of requiredFields) {
            if (!formData[field as keyof typeof formData]) return false;
        }

        if (!formData.bankDetails.bankName || !formData.bankDetails.accountHolder || !formData.bankDetails.accountNumber) {
            return false;
        }
        
        return Object.keys(validationErrors).length === 0;
    }, [formData, validationErrors]);

    useEffect(() => {
        const minPrice = minPrices[formData.zone];
        const newErrors: Record<string, string> = {};

        if (formData.pricePerKm < minPrice) {
            newErrors.pricePerKm = `Must be at least Rp ${minPrice.toLocaleString()}`;
        }

        if (formData.pricePerKmParcel < minPrice) {
            newErrors.pricePerKmParcel = `Must be at least Rp ${minPrice.toLocaleString()}`;
        }
        
        setValidationErrors(newErrors);
    }, [formData.zone, formData.pricePerKm, formData.pricePerKmParcel]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
    };

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails,
                [name]: value,
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        const dataToSave = { ...formData, pricePerDay: formData.pricePerDay || undefined };
        onSave(dataToSave, vehicle?.id);
    };

    const renderInput = (name: string, label: string, type = 'text', required = false, isNumeric = false, optionalProps = {}) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={formData[name as keyof typeof formData] as any}
                onChange={isNumeric ? handleNumberChange : handleChange}
                required={required}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                {...optionalProps}
            />
        </div>
    );
    
    const renderPriceInput = (name: 'pricePerKm' | 'pricePerKmParcel', label: string) => (
         <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label} *</label>
            <input
                type="number"
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleNumberChange}
                required
                className={`mt-1 block w-full border ${validationErrors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {validationErrors[name] && <p className="mt-1 text-xs text-red-600">{validationErrors[name]}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold text-gray-800">{vehicle ? 'Edit Bike Driver' : 'Add New Bike Driver'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Driver Details */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Driver Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderInput('driver', 'Driver Full Name', 'text', true)}
                            {renderInput('driverImage', 'Driver Image URL', 'url', true)}
                            {renderInput('driverRating', 'Driver Rating', 'number', true, true, { min: "0", max: "5", step: "0.1" })}
                            {renderInput('whatsapp', 'WhatsApp Number', 'tel')}
                        </div>
                    </fieldset>
                    
                    {/* Vehicle Details */}
                     <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Vehicle Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {renderInput('name', 'Bike Model Name', 'text', true)}
                           {renderInput('plate', 'License Plate', 'text', true)}
                           {renderInput('modelCc', 'Engine Size (e.g., 155cc)')}
                           {renderInput('color', 'Color')}
                           {renderInput('registrationYear', 'Registration Year', 'number', false, true, { min: "1990", max: new Date().getFullYear() })}
                        </div>
                    </fieldset>
                    
                     {/* Pricing & Service */}
                     <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Pricing & Service</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                                <label htmlFor="zone" className="block text-sm font-medium text-gray-700">Operating Zone *</label>
                                <select id="zone" name="zone" value={formData.zone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    {Object.values(Zone).map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                            </div>
                            <div></div> {/* Spacer */}
                            {renderPriceInput('pricePerKm', 'Price/km (Ride)')}
                            {renderPriceInput('pricePerKmParcel', 'Price/km (Parcel)')}
                            {renderInput('pricePerDay', 'Daily Tour Price (Optional)', 'number', false, true)}
                        </div>
                    </fieldset>
                    
                    {/* Bank Info */}
                     <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Bank Information</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name *</label>
                                <input type="text" id="bankName" name="bankName" value={formData.bankDetails.bankName} onChange={handleBankChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700">Account Holder *</label>
                                <input type="text" id="accountHolder" name="accountHolder" value={formData.bankDetails.accountHolder} onChange={handleBankChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number *</label>
                                <input type="text" id="accountNumber" name="accountNumber" value={formData.bankDetails.accountNumber} onChange={handleBankChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                            </div>
                        </div>
                    </fieldset>

                    {/* Status */}
                    <div className="border p-4 rounded-md">
                        <ToggleSwitch enabled={formData.isAvailable} onChange={enabled => setFormData(prev => ({...prev, isAvailable: enabled}))} enabledText="Driver is Available" disabledText="Driver is Busy" />
                    </div>

                </form>
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" formNoValidate onClick={handleSubmit} disabled={!isFormValid} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                        Save Driver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BikeDriverFormModal;
