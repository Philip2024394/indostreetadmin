import React, { useState, useEffect } from 'react';
import { VendorItem } from '../../types';
import { XIcon } from '../shared/Icons';

interface ItemEditorModalProps {
  item: VendorItem | null;
  onClose: () => void;
  onSave: (itemData: Omit<VendorItem, 'id' | 'vendorId'>) => void;
}

const ItemEditorModal: React.FC<ItemEditorModalProps> = ({ item, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setPrice(item.price);
            setImageUrl(item.imageUrl);
            setIsAvailable(item.isAvailable);
        }
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, price, imageUrl, isAvailable });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">{item ? 'Edit Item' : 'Add New Item'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">Item Name</label>
                            <input type="text" id="item-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="item-price" className="block text-sm font-medium text-gray-700">Price (Rp)</label>
                            <input type="number" id="item-price" value={price} onChange={(e) => setPrice(Number(e.target.value))} required min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="item-image-url" className="block text-sm font-medium text-gray-700">Image URL</label>
                            <input type="url" id="item-image-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemEditorModal;
