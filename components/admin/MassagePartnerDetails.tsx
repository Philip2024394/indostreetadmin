import React, { useState } from 'react';
import { Partner, PartnerType, MassagePrice, GalleryPhoto } from '../../types';
import * as api from '../../services/supabase';
import { ChevronLeftIcon, XIcon, PlusCircleIcon, TrashIcon } from '../shared/Icons';
import { blobToBase64 } from '../shared/Editable';

interface MassagePartnerDetailsProps {
    partner: Partner;
    onBack: () => void;
}

const MassagePartnerDetails: React.FC<MassagePartnerDetailsProps> = ({ partner, onBack }) => {
    const [formData, setFormData] = useState<Partner>(partner);
    const [saving, setSaving] = useState(false);
    const [newService, setNewService] = useState('');

    const isPlace = formData.partnerType === PartnerType.MassagePlace;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            profile: { ...prev.profile, [name]: value }
        }));
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePicture' | 'headerPicture') => {
        const file = e.target.files?.[0];
        if (file) {
            const dataUrl = `data:${file.type};base64,${await blobToBase64(file)}`;
            setFormData(prev => ({...prev, profile: {...prev.profile, [field]: dataUrl}}));
        }
    };
    
    // --- Services ---
    const handleAddService = () => {
        if (newService.trim() && !formData.massageServices?.includes(newService.trim())) {
            setFormData(p => ({...p, massageServices: [...(p.massageServices || []), newService.trim()]}));
            setNewService('');
        }
    };
    const handleRemoveService = (service: string) => {
        setFormData(p => ({...p, massageServices: p.massageServices?.filter(s => s !== service)}));
    };

    // --- Pricing ---
    const handlePricingChange = (id: string, field: 'duration' | 'price', value: string) => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue)) {
            setFormData(p => ({...p, massagePricing: p.massagePricing?.map(price => price.id === id ? {...price, [field]: numericValue} : price)}));
        }
    };
    const addPriceTier = () => {
        const newTier: MassagePrice = { id: `new-${Date.now()}`, duration: 60, price: 0 };
        setFormData(p => ({...p, massagePricing: [...(p.massagePricing || []), newTier]}));
    };
    const removePriceTier = (id: string) => {
        setFormData(p => ({...p, massagePricing: p.massagePricing?.filter(price => price.id !== id)}));
    };
    
    // --- Place Features ---
    const handleAmenityChange = (key: keyof NonNullable<Partner['amenities']>, checked: boolean) => {
        setFormData(p => ({...p, amenities: {...p.amenities, [key]: checked }}));
    };
     const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const dataUrl = `data:${file.type};base64,${await blobToBase64(file)}`;
            setFormData(p => ({...p, galleryImages: [...(p.galleryImages || []), {id: `new-${Date.now()}`, url: dataUrl, name: ''}]}));
        }
    };
    const handleRemoveGalleryImage = (id: string) => {
        setFormData(p => ({...p, galleryImages: p.galleryImages?.filter(img => img.id !== id)}));
    };
     const handleCaptionChange = (id: string, caption: string) => {
        setFormData(p => ({...p, galleryImages: p.galleryImages?.map(photo => photo.id === id ? { ...photo, name: caption } : photo)}));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updatePartner(partner.id, formData);
            onBack();
        } catch (error) {
            console.error("Failed to update partner:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const amenityOptions: { key: keyof NonNullable<Partner['amenities']>, label: string }[] = [
        { key: 'sauna', label: 'Sauna' }, { key: 'jacuzzi', label: 'Jacuzzi' },
        { key: 'salon', label: 'Salon' }, { key: 'nailArt', label: 'Nail Art' },
        { key: 'steamRoom', label: 'Steam Room' },
    ];

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Partner List
            </button>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Core Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={isPlace ? "Place Name" : "Therapist Name"} name="name" value={formData.profile.name || formData.profile.shopName || ''} onChange={handleProfileChange} />
                    <InputField label="WhatsApp Number" name="phone" value={formData.phone} onChange={handleChange} />
                    <InputField label="Area / City" name="address" value={formData.address} onChange={handleChange} />
                    <InputField label="Street / Service Type" name="street" value={formData.street} onChange={handleChange} helpText={isPlace ? 'e.g., Jl. Monkey Forest' : 'Should be "Home Service"'}/>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Bio / Description</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 sm:text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Service Status</label>
                        <select name="massageStatus" value={formData.massageStatus} onChange={e => setFormData({...formData, massageStatus: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="online">Online</option>
                            <option value="busy">Busy</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Branding & Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUploader label={isPlace ? "Logo / Main Photo" : "Profile Picture"} currentImage={formData.profile.profilePicture || ''} onFileChange={e => handleFileChange(e, 'profilePicture')} />
                    {!isPlace && <ImageUploader label="Header Image" currentImage={formData.profile.headerPicture || ''} onFileChange={e => handleFileChange(e, 'headerPicture')} />}
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Services & Pricing</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Massage Types</label>
                         <div className="mt-2 flex">
                            <input type="text" value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="e.g., Balinese" className="flex-grow border-gray-300 rounded-l-md shadow-sm sm:text-sm" />
                            <button type="button" onClick={handleAddService} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 font-medium">Add</button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {(formData.massageServices || []).map(service => (
                                <span key={service} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full">
                                    {service}
                                    <button type="button" onClick={() => handleRemoveService(service)} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200"><XIcon className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Pricing Tiers</label>
                        <div className="mt-2 space-y-2">
                            {(formData.massagePricing || []).map(tier => (
                                <div key={tier.id} className="flex items-center space-x-2">
                                    <input type="number" placeholder="Duration (min)" value={tier.duration} onChange={e => handlePricingChange(tier.id, 'duration', e.target.value)} className="w-full border border-gray-300 rounded-md p-1.5 text-sm"/>
                                    <input type="number" placeholder="Price (Rp)" value={tier.price} onChange={e => handlePricingChange(tier.id, 'price', e.target.value)} className="w-full border border-gray-300 rounded-md p-1.5 text-sm"/>
                                    <button type="button" onClick={() => removePriceTier(tier.id)} className="p-2 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                            <button type="button" onClick={addPriceTier} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mt-2">
                                <PlusCircleIcon className="w-5 h-5 mr-1" /> Add Tier
                            </button>
                        </div>
                    </div>
                 </div>
            </div>

            {isPlace && (
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Place Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Business Hours" name="businessHours" value={formData.businessHours || ''} onChange={handleChange} placeholder="e.g., 10:00 AM - 9:00 PM" />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amenities</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {amenityOptions.map(({ key, label }) => (
                                    <div key={key} className="flex items-center">
                                        <input id={`amenity-${key}`} type="checkbox" checked={!!formData.amenities?.[key]} onChange={(e) => handleAmenityChange(key, e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                                        <label htmlFor={`amenity-${key}`} className="ml-2 block text-sm text-gray-900">{label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">Photo Gallery</label>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(formData.galleryImages || []).map(photo => (
                                <div key={photo.id} className="group relative border rounded-md p-2 space-y-2">
                                    <img src={photo.url} alt={photo.name} className="w-full h-24 object-cover rounded-md" />
                                    <input type="text" placeholder="Caption..." value={photo.name} onChange={(e) => handleCaptionChange(photo.id, e.target.value)} className="w-full border border-gray-300 rounded-md p-1 text-xs"/>
                                    <button type="button" onClick={() => handleRemoveGalleryImage(photo.id)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><XIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                            {(formData.galleryImages || []).length < 4 && <ImageUploader label="Add Photo" onFileChange={handleGalleryUpload} />}
                        </div>
                    </div>
                 </div>
            )}

            <div className="flex justify-end mt-4">
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: any) => void; type?: string; helpText?: string; }> = ({ label, name, value, onChange, type = 'text', helpText }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 sm:text-sm" />
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
);

const ImageUploader: React.FC<{ label: string; currentImage?: string; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, currentImage, onFileChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <label className="mt-1 cursor-pointer block w-full h-24 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500">
            {currentImage ? <img src={currentImage} alt={label} className="h-full w-full object-cover rounded-md" /> : <span className="text-xs text-gray-500">Click to upload</span>}
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </label>
    </div>
);

export default MassagePartnerDetails;
