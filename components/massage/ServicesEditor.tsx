import React, { useState, useEffect, useRef } from 'react';
import { Partner, MassagePrice, MassageType } from '../../types';
import * as api from '../../services/supabase';
import { XIcon, PlusCircleIcon, TrashIcon, ChevronDownIcon, CheckIcon } from '../shared/Icons';

interface ServicesEditorProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
}

const ServicesEditor: React.FC<ServicesEditorProps> = ({ partner, onUpdate }) => {
    const [services, setServices] = useState(partner.massageServices || []);
    const [pricing, setPricing] = useState<MassagePrice[]>(partner.massagePricing || []);
    const [saving, setSaving] = useState(false);

    // New states for massage type selection
    const [allMassageTypes, setAllMassageTypes] = useState<MassageType[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        api.getMassageTypes().then(setAllMassageTypes);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const handleAddService = (serviceToAdd: string) => {
        if (serviceToAdd && !services.includes(serviceToAdd)) {
            setServices([...services, serviceToAdd]);
        }
    };
    
    const handleRemoveService = (serviceToRemove: string) => {
        setServices(services.filter(s => s !== serviceToRemove));
    };
    
    const handlePricingChange = (id: string, field: 'duration' | 'price', value: string) => {
        const sanitizedValue = value.replace(/[^0-9]/g, '');
        let numericValue = sanitizedValue === '' ? 0 : parseInt(sanitizedValue, 10);

        if (field === 'price') {
            numericValue *= 1000;
        }
        
        setPricing(prev => prev.map(p => p.id === id ? { ...p, [field]: numericValue } : p));
    };

    const addPriceTier = () => {
        if (pricing.length >= 3) return;
        setPricing(prev => [...prev, { id: `new-${Date.now()}`, duration: 60, price: 0 }]);
    };

    const removePriceTier = (id: string) => {
        setPricing(prev => prev.filter(p => p.id !== id));
    };

    const handleSave = async () => {
        setSaving(true);
        await onUpdate({
            massageServices: services,
            massagePricing: pricing
        });
        setSaving(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Services & Pricing</h3>
            <div className="space-y-6">
                {/* Services */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Massage Types Offered</label>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">Add Massage Type:</span>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                aria-haspopup="true"
                                aria-expanded={isDropdownOpen}
                            >
                                <PlusCircleIcon className={`w-6 h-6 transition-transform ${isDropdownOpen ? 'rotate-45' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                    <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                                        {allMassageTypes
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(type => {
                                                const isSelected = services.includes(type.name);
                                                return (
                                                    <a
                                                        key={type.id}
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (!isSelected) {
                                                                handleAddService(type.name);
                                                                setIsDropdownOpen(false);
                                                            }
                                                        }}
                                                        className={`flex justify-between items-center px-4 py-2 text-sm ${
                                                            isSelected
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                        role="menuitem"
                                                        aria-disabled={isSelected}
                                                    >
                                                        <span>{type.name}</span>
                                                        {isSelected && <CheckIcon className="w-4 h-4 text-green-500" />}
                                                    </a>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {services.map(service => (
                            <span key={service} className="flex items-center bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-1 rounded-full">
                                {service}
                                <button onClick={() => handleRemoveService(service)} className="ml-1.5 p-0.5 rounded-full hover:bg-orange-200">
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Pricing */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pricing Tiers</label>
                    <div className="mt-2 space-y-3">
                        {pricing.map(tier => (
                            <div key={tier.id} className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50/50">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500">Duration (min)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={tier.duration === 0 ? '' : tier.duration}
                                        onChange={(e) => handlePricingChange(tier.id, 'duration', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:text-sm"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500">Price (Rp)</label>
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-500 sm:text-sm">
                                            Rp
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={tier.price === 0 ? '' : tier.price / 1000}
                                            onChange={(e) => handlePricingChange(tier.id, 'price', e.target.value)}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-1 pl-7 pr-7 sm:text-sm"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">
                                            K
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => removePriceTier(tier.id)} className="p-2 text-gray-400 hover:text-red-600 self-end mb-1">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                         {pricing.length < 3 ? (
                            <button onClick={addPriceTier} className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-800 mt-2">
                                <PlusCircleIcon className="w-5 h-5 mr-1" />
                                Add Price Tier
                            </button>
                         ) : (
                            <p className="text-xs text-gray-500 pt-2">Maximum of 3 price tiers reached.</p>
                         )}
                    </div>
                </div>

                 {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
                >
                    {saving ? 'Saving...' : 'Save Services & Pricing'}
                </button>
            </div>
        </div>
    );
};

export default ServicesEditor;
