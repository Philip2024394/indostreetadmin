import React, { useState } from 'react';
import { Partner } from '../../types';
import { XIcon } from '../shared/Icons';

interface ServicesEditorProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
}

const ServicesEditor: React.FC<ServicesEditorProps> = ({ partner, onUpdate }) => {
    const [services, setServices] = useState(partner.massageServices || []);
    const [newService, setNewService] = useState('');
    const [pricing, setPricing] = useState({
        '60min': partner.massagePricing?.['60min'] || 0,
        '90min': partner.massagePricing?.['90min'] || 0,
        '120min': partner.massagePricing?.['120min'] || 0,
    });
    const [saving, setSaving] = useState(false);
    
    const handleAddService = () => {
        if (newService.trim() && !services.includes(newService.trim())) {
            setServices([...services, newService.trim()]);
            setNewService('');
        }
    };
    
    const handleRemoveService = (serviceToRemove: string) => {
        setServices(services.filter(s => s !== serviceToRemove));
    };
    
    const handlePricingChange = (duration: '60min' | '90min' | '120min', value: string) => {
        setPricing(prev => ({ ...prev, [duration]: Number(value) }));
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
                    <label className="block text-sm font-medium text-gray-700">Massage Types Offered</label>
                    <div className="mt-2 flex">
                        <input
                            type="text"
                            value={newService}
                            onChange={(e) => setNewService(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(); } }}
                            placeholder="e.g., Balinese"
                            className="flex-grow border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <button onClick={handleAddService} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 font-medium">Add</button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {services.map(service => (
                            <span key={service} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full">
                                {service}
                                <button onClick={() => handleRemoveService(service)} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200">
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
                        {(['60min', '90min', '120min'] as const).map(duration => {
                            const label = `${duration.replace('min', '')} min`;
                            return (
                                <div key={duration}>
                                    <label htmlFor={`price-${duration}`} className="block text-xs font-medium text-gray-500">Price for {label} (Rp)</label>
                                    <input
                                        type="number"
                                        id={`price-${duration}`}
                                        value={pricing[duration]}
                                        onChange={(e) => handlePricingChange(duration, e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                        min="0"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                 {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {saving ? 'Saving...' : 'Save Services & Pricing'}
                </button>
            </div>
        </div>
    );
};

export default ServicesEditor;
