import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Prospect, PartnerType } from '../../types';
import { XIcon } from '../shared/Icons';

declare global {
    interface Window {
        google: any;
    }
}

interface ProspectFormModalProps {
  prospect: Prospect | null;
  onClose: () => void;
  onSave: (data: Omit<Prospect, 'id' | 'agentId' | 'createdAt' | 'status'>, id?: string) => void;
}

const ProspectFormModal: React.FC<ProspectFormModalProps> = ({ prospect, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        street: '',
        partnerType: PartnerType.BikeDriver,
        meetingNotes: '',
        meetingDateTime: new Date().toISOString().slice(0, 16),
        callbackDateTime: '',
    });
    
    const streetInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (prospect) {
            setFormData({
                name: prospect.name,
                email: prospect.email,
                phone: prospect.phone,
                address: prospect.address,
                street: prospect.street,
                partnerType: prospect.partnerType,
                meetingNotes: prospect.meetingNotes,
                meetingDateTime: new Date(prospect.meetingDateTime).toISOString().slice(0, 16),
                callbackDateTime: prospect.callbackDateTime ? new Date(prospect.callbackDateTime).toISOString().slice(0, 16) : '',
            });
        }
    }, [prospect]);

    useEffect(() => {
        if (!window.google || !streetInputRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(streetInputRef.current, {
            componentRestrictions: { country: "id" },
            fields: ["address_components", "geometry", "name"],
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.address_components) return;

            const components = place.address_components;
            const streetNumber = components.find((c: any) => c.types.includes('street_number'))?.long_name || '';
            const route = components.find((c: any) => c.types.includes('route'))?.long_name || '';
            const city = components.find((c: any) => c.types.includes('locality'))?.long_name ||
                         components.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name || '';
            
            setFormData(prev => ({
                ...prev,
                street: `${streetNumber} ${route}`.trim(),
                address: city,
            }));
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, prospect?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold text-gray-800">{prospect ? 'Edit Prospect' : 'Add New Prospect'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Business/Owner Name" name="name" value={formData.name} onChange={handleChange} required />
                        <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
                        <InputField label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" required />
                        <InputField label="City/Region" name="address" value={formData.address} onChange={handleChange} required />
                        <InputField label="Street Address" name="street" value={formData.street} onChange={handleChange} required ref={streetInputRef} />
                        <div>
                            <label htmlFor="partnerType" className="block text-sm font-medium text-gray-700">Business Type</label>
                            <select id="partnerType" name="partnerType" value={formData.partnerType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                                {Object.values(PartnerType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="meetingNotes" className="block text-sm font-medium text-gray-700">Meeting Notes / Progress</label>
                        <textarea id="meetingNotes" name="meetingNotes" value={formData.meetingNotes} onChange={handleChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <InputField label="Meeting Date & Time" name="meetingDateTime" value={formData.meetingDateTime} onChange={handleChange} type="datetime-local" required />
                         <InputField label="Set Callback Reminder (Optional)" name="callbackDateTime" value={formData.callbackDateTime} onChange={handleChange} type="datetime-local" />
                    </div>
                </form>
                <div className="p-4 border-t flex justify-end space-x-2 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">Save Prospect</button>
                </div>
            </div>
        </div>
    );
};

const InputField = forwardRef<HTMLInputElement, { label: string, name: string, value: string, onChange: (e: any) => void, type?: string, required?: boolean }>(
    ({ label, name, value, onChange, type = 'text', required = false }, ref) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
        <input ref={ref} type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
    </div>
));

export default ProspectFormModal;