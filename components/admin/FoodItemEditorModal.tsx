import React, { useState, useEffect } from 'react';
import { VendorItem, Partner } from '../../types';
import { XIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

interface FoodItemEditorModalProps {
  item: VendorItem | null;
  vendors: Partner[];
  onClose: () => void;
  onSave: (data: Omit<VendorItem, 'id'>, id?: string) => void;
}

const FoodItemEditorModal: React.FC<FoodItemEditorModalProps> = ({ item, vendors, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<VendorItem, 'id'>>({
        name: '',
        vendorId: vendors[0]?.id || '',
        category: '',
        price: 0,
        isAvailable: true,
        imageUrl: '',
        description: '',
        longDescription: '',
        chiliLevel: 0,
        cookingTime: 0,
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                vendorId: item.vendorId,
                category: item.category || '',
                price: item.price,
                isAvailable: item.isAvailable,
                imageUrl: item.imageUrl,
                description: item.description || '',
                longDescription: item.longDescription || '',
                chiliLevel: item.chiliLevel || 0,
                cookingTime: item.cookingTime || 0,
            });
        }
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['price', 'chiliLevel', 'cookingTime'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, item?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold text-gray-800">{item ? 'Edit Food Item' : 'Add New Food Item'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <InputField label="Name" name="name" value={formData.name} onChange={handleChange} required />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vendor</label>
                            <select name="vendorId" value={formData.vendorId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.profile.shopName || v.profile.name}</option>)}
                            </select>
                        </div>
                        <InputField label="Category" name="category" value={formData.category || ''} onChange={handleChange} required />
                     </div>
                     <InputField label="Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange} type="url" required />
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Short Description (for menus)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md p-2"></textarea>
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Long Description (for directory)</label>
                        <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={5} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required></textarea>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField label="Price (Rp)" name="price" value={formData.price} onChange={handleChange} type="number" required />
                        <InputField label="Chili Level (0-4)" name="chiliLevel" value={formData.chiliLevel || 0} onChange={handleChange} type="number" />
                        <InputField label="Cooking Time (min)" name="cookingTime" value={formData.cookingTime || 0} onChange={handleChange} type="number" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Availability</label>
                        <div className="mt-2">
                            <ToggleSwitch enabled={formData.isAvailable} onChange={val => setFormData(p => ({ ...p, isAvailable: val }))} />
                        </div>
                     </div>
                </form>
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" formNoValidate onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Item</button>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, name: string, value: string | number, onChange: (e: any) => void, type?: string, required?: boolean }> = 
({ label, name, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
    </div>
);

export default FoodItemEditorModal;
