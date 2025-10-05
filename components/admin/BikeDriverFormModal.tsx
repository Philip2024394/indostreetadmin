import React, { useState, useEffect } from 'react';
import { Vehicle, Zone, VehicleType, TourPackage, TourDestination } from '../../types';
import * as api from '../../services/supabase';
import { XIcon, PlusCircleIcon, TrashIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

interface VehicleFormModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (data: Omit<Vehicle, 'id'>, id?: string) => void;
}

const defaultFormData: Omit<Vehicle, 'id'> = {
    type: VehicleType.Bike,
    serviceType: 'ride',
    driver: '',
    driverImage: '',
    driverRating: 4.5,
    name: '',
    plate: '',
    isAvailable: true,
    zone: Zone.Zone1,
    pricePerKm: 0,
    pricePerKmParcel: 0,
    whatsapp: '',
    modelCc: '',
    color: '',
    registrationYear: new Date().getFullYear(),
    pricePerDay: 0,
    listingType: 'rent',
    salePrice: 0,
    bankDetails: {
        bankName: '',
        accountHolder: '',
        accountNumber: '',
    },
    seats: undefined,
    tourPackages: [],
    associatedDestinationID: '',
    operatingHours: '',
};

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ vehicle, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>(defaultFormData);
    const [destinations, setDestinations] = useState<TourDestination[]>([]);

    useEffect(() => {
        if (vehicle) {
            setFormData({
                ...defaultFormData,
                ...vehicle,
                pricePerDay: vehicle.pricePerDay ?? 0,
                salePrice: vehicle.salePrice ?? 0,
                listingType: vehicle.listingType ?? 'rent',
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [vehicle]);

    useEffect(() => {
        if (formData.type === VehicleType.Jeep) {
            api.getTourDestinations().then(setDestinations);
        }
    }, [formData.type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'type') {
                newState.serviceType = value === VehicleType.Bike ? 'ride' : 'tour';
            }
            return newState;
        });
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
    };

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            bankDetails: { ...prev.bankDetails, [name]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, vehicle?.id);
    };

    const handlePackageChange = (id: string, field: keyof TourPackage, value: string | number | string[]) => {
        setFormData(prev => ({
            ...prev,
            tourPackages: (prev.tourPackages || []).map(p => p.id === id ? { ...p, [field]: value } : p)
        }));
    };

    const addPackage = () => {
        const newPackage: TourPackage = { id: `new-${Date.now()}`, name: '', description: '', price: 0, duration: '', includes: [] };
        setFormData(prev => ({ ...prev, tourPackages: [...(prev.tourPackages || []), newPackage] }));
    };

    const removePackage = (id: string) => {
        setFormData(prev => ({...prev, tourPackages: (prev.tourPackages || []).filter(p => p.id !== id)}));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold text-gray-800">{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Type *</label>
                        <select name="type" value={formData.type} onChange={handleChange} disabled={!!vehicle} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 disabled:bg-gray-100">
                            {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Driver & Vehicle Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="driver" label="Driver Full Name" value={formData.driver} onChange={handleChange} required />
                            <InputField name="driverImage" label="Vehicle Image URL" value={formData.driverImage} onChange={handleChange} type="url" required />
                            <InputField name="whatsapp" label="WhatsApp Number" value={formData.whatsapp || ''} onChange={handleChange} />
                            <InputField name="name" label="Vehicle Model Name" value={formData.name} onChange={handleChange} required />
                            <InputField name="plate" label="License Plate" value={formData.plate} onChange={handleChange} required />
                            <InputField name="color" label="Color" value={formData.color || ''} onChange={handleChange} />
                            <InputField name="registrationYear" label="Registration Year" value={formData.registrationYear || ''} onChange={handleNumberChange} type="number" />
                            {formData.type === VehicleType.Bike && <InputField name="modelCc" label="Engine Size (cc)" value={formData.modelCc || ''} onChange={handleChange} />}
                            {(formData.type === VehicleType.Jeep || formData.type === VehicleType.Bus) && <InputField name="seats" label="Max. Passengers" value={formData.seats || ''} onChange={handleNumberChange} type="number" />}
                        </div>
                    </fieldset>

                     <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Listing Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Listing Type *</label>
                                <select name="listingType" value={formData.listingType} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                    <option value="rent">For Rent</option>
                                    <option value="sale">For Sale</option>
                                    <option value="both">Rent & Sale</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {(formData.listingType === 'rent' || formData.listingType === 'both') && (
                                <InputField name="pricePerDay" label="Rental Price per Day (Rp)" value={formData.pricePerDay || ''} onChange={handleNumberChange} type="number" />
                            )}
                            {(formData.listingType === 'sale' || formData.listingType === 'both') && (
                                <InputField name="salePrice" label="Sale Price (Rp)" value={formData.salePrice || ''} onChange={handleNumberChange} type="number" />
                            )}
                        </div>
                    </fieldset>

                    {formData.type === VehicleType.Bike && (
                        <fieldset className="border p-4 rounded-md">
                            <legend className="px-2 font-semibold text-gray-700">Bike Pricing</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Operating Zone *</label>
                                    <select name="zone" value={formData.zone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        {Object.values(Zone).map(z => <option key={z} value={z}>{z}</option>)}
                                    </select>
                                </div>
                                <InputField name="pricePerKm" label="Price/km (Ride)" value={formData.pricePerKm || ''} onChange={handleNumberChange} type="number" required />
                                <InputField name="pricePerKmParcel" label="Price/km (Parcel)" value={formData.pricePerKmParcel || ''} onChange={handleNumberChange} type="number" required />
                            </div>
                        </fieldset>
                    )}

                    {formData.type === VehicleType.Jeep && (
                         <fieldset className="border p-4 rounded-md">
                            <legend className="px-2 font-semibold text-gray-700">Jeep Tour Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField name="operatingHours" label="Operating Hours" value={formData.operatingHours || ''} onChange={handleChange} placeholder="e.g., 5:00 AM - 5:00 PM"/>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Associated Destination</label>
                                    <select name="associatedDestinationID" value={formData.associatedDestinationID} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option value="">None</option>
                                        {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-md font-semibold text-gray-800 mb-2">Tour Packages</h4>
                                <div className="space-y-4">
                                    {(formData.tourPackages || []).map((pkg, index) => (
                                        <div key={pkg.id} className="p-3 border rounded-md bg-gray-50 relative">
                                            <button type="button" onClick={() => removePackage(pkg.id)} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                {/* FIX: Added the required 'name' prop to the InputField components to resolve TypeScript errors. */}
                                                <InputField name={`pkg_name_${pkg.id}`} label="Package Name" value={pkg.name} onChange={(e) => handlePackageChange(pkg.id, 'name', e.target.value)} />
                                                <InputField name={`pkg_duration_${pkg.id}`} label="Duration" value={pkg.duration} onChange={(e) => handlePackageChange(pkg.id, 'duration', e.target.value)} placeholder="e.g., 2-3 Hours"/>
                                                <InputField name={`pkg_price_${pkg.id}`} label="Price (Rp)" type="number" value={pkg.price} onChange={(e) => handlePackageChange(pkg.id, 'price', Number(e.target.value))} />
                                                <InputField name={`pkg_includes_${pkg.id}`} label="Includes (comma-separated)" value={pkg.includes.join(', ')} onChange={(e) => handlePackageChange(pkg.id, 'includes', e.target.value.split(',').map(s => s.trim()))} />
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700">Description</label>
                                                    <textarea value={pkg.description} onChange={(e) => handlePackageChange(pkg.id, 'description', e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addPackage} className="mt-2 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                                    <PlusCircleIcon className="w-5 h-5 mr-1" /> Add Package
                                </button>
                            </div>
                        </fieldset>
                    )}
                    
                    <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Bank Information</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <InputField name="bankName" label="Bank Name" value={formData.bankDetails.bankName} onChange={handleBankChange} required />
                           <InputField name="accountHolder" label="Account Holder" value={formData.bankDetails.accountHolder} onChange={handleBankChange} required />
                           <InputField name="accountNumber" label="Account Number" value={formData.bankDetails.accountNumber} onChange={handleBankChange} required />
                        </div>
                    </fieldset>

                    <div className="border p-4 rounded-md">
                        <ToggleSwitch enabled={formData.isAvailable} onChange={enabled => setFormData(prev => ({...prev, isAvailable: enabled}))} enabledText="Vehicle is Available" disabledText="Vehicle is Unavailable" />
                    </div>
                </form>
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" formNoValidate onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Save Vehicle
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{name: string, label: string, value: string | number, onChange: (e: any) => void, type?: string, required?: boolean, placeholder?: string}> = 
({ name, label, value, onChange, type = 'text', required = false, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-medium text-gray-700">{label}{required && ' *'}</label>
        <input
            type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
    </div>
);

export default VehicleFormModal;