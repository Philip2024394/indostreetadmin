import React, { useState, useEffect } from 'react';
import { FoodType, FoodTypeCategory } from '../../types';
import { XIcon } from '../shared/Icons';

interface FoodTypeEditorModalProps {
  foodType: FoodType | null;
  onClose: () => void;
  onSave: (data: Omit<FoodType, 'id'>) => Promise<void>;
}

const categories = Object.values(FoodTypeCategory);

const FoodTypeEditorModal: React.FC<FoodTypeEditorModalProps> = ({ foodType, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState<FoodTypeCategory>(categories[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (foodType) {
            setName(foodType.name);
            setDescription(foodType.description);
            setImageUrl(foodType.imageUrl);
            setCategory(foodType.category);
        } else {
            setName('');
            setDescription('');
            setImageUrl('');
            setCategory(categories[0]);
        }
    }, [foodType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onSave({ name, description, imageUrl, category });
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">{foodType ? 'Edit Food Type' : 'Add New Food Type'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 sm:text-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value as FoodTypeCategory)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 sm:text-sm">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image URL</label>
                            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 sm:text-sm" placeholder="https://placehold.co/300x200" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} className="mt-1 block w-full border border-gray-300 rounded-md p-2 sm:text-sm" />
                        </div>
                        {error && (
                            <div className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300">
                             {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodTypeEditorModal;