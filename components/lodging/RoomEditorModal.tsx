import React, { useState, useEffect } from 'react';
import { Room, RoomAmenities } from '../../types';
import { XIcon } from '../shared/Icons';
import { blobToBase64 } from '../shared/Editable';
import ToggleSwitch from '../shared/ToggleSwitch';

interface RoomEditorModalProps {
    room: Room | null;
    onClose: () => void;
    onSave: (data: Omit<Room, 'id' | 'vendorId'>) => void;
}

const defaultRoomData: Omit<Room, 'id' | 'vendorId'> = {
    name: '',
    pricePerNight: 0,
    mainImage: '',
    thumbnails: [],
    isAvailable: true,
    amenities: {},
    specialOffer: {
        enabled: false,
        discountPercentage: 0,
    },
};

const RoomEditorModal: React.FC<RoomEditorModalProps> = ({ room, onClose, onSave }) => {
    const [formData, setFormData] = useState(defaultRoomData);
    
    useEffect(() => {
        if (room) {
            setFormData(room);
        } else {
            setFormData(defaultRoomData);
        }
    }, [room]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'pricePerNight' ? Number(value) : value }));
    };

    const handleAmenityChange = (key: keyof RoomAmenities, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            amenities: { ...prev.amenities, [key]: checked }
        }));
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'thumb', index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const dataUrl = `data:${file.type};base64,${await blobToBase64(file)}`;

        if (type === 'main') {
            setFormData(prev => ({ ...prev, mainImage: dataUrl }));
        } else if (type === 'thumb' && index !== undefined) {
            setFormData(prev => {
                const newThumbs = [...prev.thumbnails];
                newThumbs[index] = dataUrl;
                return { ...prev, thumbnails: newThumbs };
            });
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const amenityOptions: { key: keyof RoomAmenities, label: string }[] = [
        { key: 'privatePool', label: 'Private Pool' },
        { key: 'balcony', label: 'Balcony/Terrace' },
        { key: 'seaView', label: 'Sea View' },
        { key: 'kitchenette', label: 'Kitchenette' },
        { key: 'jacuzziTub', label: 'Jacuzzi Tub' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold text-gray-800">{room ? 'Edit Room' : 'Add New Room'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Room Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 sm:text-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price per Night (Rp)</label>
                            <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} required min="0" className="mt-1 block w-full border border-gray-300 rounded-md p-2 sm:text-sm"/>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Images</label>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ImageInput label="Main Image" image={formData.mainImage} onChange={e => handleFileChange(e, 'main')} />
                            {[0, 1, 2].map(i => <ImageInput key={i} label={`Thumbnail ${i + 1}`} image={formData.thumbnails[i]} onChange={e => handleFileChange(e, 'thumb', i)} />)}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room Amenities</label>
                            <div className="space-y-2">
                                {amenityOptions.map(({ key, label }) => (
                                     <div key={key} className="flex items-center">
                                        <input id={`room-amenity-${key}`} type="checkbox" checked={!!formData.amenities[key]} onChange={(e) => handleAmenityChange(key, e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                                        <label htmlFor={`room-amenity-${key}`} className="ml-2 block text-sm text-gray-900">{label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Availability</label>
                                <div className="mt-2"><ToggleSwitch enabled={formData.isAvailable} onChange={val => setFormData(p => ({ ...p, isAvailable: val }))} /></div>
                            </div>
                            <div className="p-4 border rounded-md bg-gray-50">
                                <label className="block text-sm font-medium text-gray-700">Last-Minute Deal</label>
                                <p className="text-xs text-gray-500 mb-2">Activates 1hr before check-in for 3hrs.</p>
                                <ToggleSwitch enabled={formData.specialOffer.enabled} onChange={val => setFormData(p => ({ ...p, specialOffer: {...p.specialOffer, enabled: val} }))} />
                                {formData.specialOffer.enabled && (
                                    <div className="mt-2">
                                        <label className="block text-xs font-medium text-gray-700">Discount Percentage (%)</label>
                                        <input type="number" min="0" max="100" value={formData.specialOffer.discountPercentage} onChange={e => setFormData(p => ({ ...p, specialOffer: {...p.specialOffer, discountPercentage: Number(e.target.value)} }))} className="mt-1 block w-full border border-gray-300 rounded-md p-1 text-sm"/>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </form>
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" onClick={handleSubmit} form="room-editor-form" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Room</button>
                </div>
            </div>
        </div>
    );
};

const ImageInput: React.FC<{ label: string, image?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, image, onChange }) => (
    <div className="text-center">
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <label className="cursor-pointer block w-full h-24 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500">
            {image ? <img src={image} alt={label} className="h-full w-full object-cover rounded-md" /> : <span className="text-xs text-gray-500">Click to upload</span>}
            <input type="file" accept="image/*" className="hidden" onChange={onChange} />
        </label>
    </div>
);

export default RoomEditorModal;
