import React, { useState, useEffect } from 'react';
import { Vehicle, Zone, VehicleType, TourPackage, TourDestination } from '../../types';
import * as api from '../../services/supabase';
import { XIcon, PlusCircleIcon, TrashIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

interface VehicleFormModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (data: Omit<Vehicle, 'id'>, id?: string) => void;
  defaultVehicleType?: VehicleType;
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
    image_set: {
        searching: '',
        // FIX: Changed `onTheWay` to `on_the_way` to match the type definition.
        on_the_way: '',
        arrived: '',
        completed: ''
    }
};

// Fix: Define the missing InputField component.
const InputField: React.FC<{ name: string; label: string; value: string | number; onChange: (e: any) => void; type?: string; required?: boolean; placeholder?: string; }> = 
({ name, label, value, onChange, type = 'text', required = false, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-orange-500 focus:border-orange-500"/>
    </div>
);

const ImageUrlInput: React.FC<{ name: string; label: string; value?: string; onChange: (e: any) => void; }> = 
({ name, label, value, onChange }) => (
    <div className="md:col-span-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex items-center space-x-2">
            <input type="url" id={name} name={name} value={value || ''} onChange={onChange} placeholder="https://..." className="flex-grow block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-orange-500 focus:border-orange-500"/>
            {value ? (
                <img src={value} alt="Preview" className="w-10 h-10 object-contain rounded-md border bg-gray-100" onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/f8f8f8/c0c0c0?text=Error'; }} />
            ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-md border bg-gray-100 text-gray-400 text-xs">
                    N/A
                </div>
            )}
        </div>
    </div>
);


const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ vehicle, onClose, onSave, defaultVehicleType }) => {
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
                image_set: {
                    searching: vehicle.image_set?.searching || '',
                    // FIX: Changed `onTheWay` to `on_the_way` to match the type definition.
                    on_the_way: vehicle.image_set?.on_the_way || '',
                    arrived: vehicle.image_set?.arrived || '',
                    completed: vehicle.image_set?.completed || ''
                }
            });
        } else {
            const initialType = defaultVehicleType || VehicleType.Bike;
            setFormData({
                ...defaultFormData,
                type: initialType,
                serviceType: initialType === VehicleType.Bike ? 'ride' : 'tour'
            });
        }
    }, [vehicle, defaultVehicleType]);

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

    const handleImageSetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            image_set: { ...(prev.image_set || {}), [name]: value }
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
                        <select name="type" value={formData.type} onChange={handleChange} disabled={!!vehicle || !!defaultVehicleType} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 disabled:bg-gray-100">
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

                    {(formData.type === VehicleType.Bike || formData.type === VehicleType.Car) && (
                        <fieldset className="border p-4 rounded-md">
                            <legend className="px-2 font-semibold text-gray-700">{formData.type} Pricing</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField name="pricePerKm" label="Ride Price per Km (Rp)" value={formData.pricePerKm || ''} onChange={handleNumberChange} type="number" />
                                <InputField name="pricePerKmParcel" label="Parcel Price per Km (Rp)" value={formData.pricePerKmParcel || ''} onChange={handleNumberChange} type="number" />
                            </div>
                        </fieldset>
                    )}

                    {formData.type === VehicleType.Jeep && (
                        <fieldset className="border p-4 rounded-md">
                            <legend className="px-2 font-semibold text-gray-700">Tour Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Associated Destination</label>
                                    <select name="associatedDestinationID" value={formData.associatedDestinationID} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option value="">Select a base destination</option>
                                        {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <InputField name="operatingHours" label="Operating Hours" value={formData.operatingHours || ''} onChange={handleChange} placeholder="e.g., 08:00 - 17:00"/>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-2">Tour Packages</h4>
                                {(formData.tourPackages || []).map(pkg => (
                                    <div key={pkg.id} className="border p-3 rounded-md mb-2 bg-gray-50 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-grow pr-2">
                                                <InputField label="Package Name" name="name" value={pkg.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackageChange(pkg.id, 'name', e.target.value)} />
                                            </div>
                                            <button type="button" onClick={() => removePackage(pkg.id)} className="p-2 text-gray-400 hover:text-red-600 mt-6"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                        <InputField label="Description" name="description" value={pkg.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackageChange(pkg.id, 'description', e.target.value)} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <InputField label="Price (Rp)" name="price" type="number" value={pkg.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackageChange(pkg.id, 'price', Number(e.target.value))} />
                                            <InputField label="Duration" name="duration" value={pkg.duration} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackageChange(pkg.id, 'duration', e.target.value)} placeholder="e.g., 4 hours" />
                                        </div>
                                        <InputField label="Includes (comma-separated)" name="includes" value={pkg.includes.join(', ')} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackageChange(pkg.id, 'includes', e.target.value.split(',').map(s => s.trim()))} />
                                    </div>
                                ))}
                                <button type="button" onClick={addPackage} className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-800 mt-2">
                                    <PlusCircleIcon className="w-5 h-5 mr-1" /> Add Package
                                </button>
                            </div>
                        </fieldset>
                    )}

                     <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Bank Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField name="bankName" label="Bank Name" value={formData.bankDetails.bankName} onChange={handleBankChange} />
                            <InputField name="accountHolder" label="Account Holder" value={formData.bankDetails.accountHolder} onChange={handleBankChange} />
                            <InputField name="accountNumber" label="Account Number" value={formData.bankDetails.accountNumber} onChange={handleBankChange} />
                        </div>
                    </fieldset>

                    <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-gray-700">Status-Based Images</legend>
                        <p className="text-sm text-gray-500 mb-4">Images shown to users during a ride. If blank, a default is used.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ImageUrlInput name="searching" label="Searching Image URL" value={formData.image_set?.searching} onChange={handleImageSetChange} />
                            {/* FIX: Changed `onTheWay` to `on_the_way` to match the type definition. */}
                            <ImageUrlInput name="on_the_way" label="On The Way Image URL" value={formData.image_set?.on_the_way} onChange={handleImageSetChange} />
                            <ImageUrlInput name="arrived" label="Arrived Image URL" value={formData.image_set?.arrived} onChange={handleImageSetChange} />
                            <ImageUrlInput name="completed" label="Completed Image URL" value={formData.image_set?.completed} onChange={handleImageSetChange} />
                        </div>
                    </fieldset>
                </form>
                <div className="p-4 border-t flex justify-end space-x-2 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">Save Vehicle</button>
                </div>
            </div>
        </div>
    );
};

export default VehicleFormModal;
