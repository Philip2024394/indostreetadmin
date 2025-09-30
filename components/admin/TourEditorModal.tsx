import React, { useState, useEffect } from 'react';
import { TourDestination } from '../../types';
import { XIcon } from '../shared/Icons';

interface TourEditorModalProps {
  destination: TourDestination | null;
  onClose: () => void;
  onSave: (data: Omit<TourDestination, 'id'>) => void;
}

// Fix: Use a const assertion to infer a literal union type instead of string[]
const categories = [
    'Temples & Historical Sites',
    'Nature & Outdoors',
    'Culture & Art'
] as const;

const TourEditorModal: React.FC<TourEditorModalProps> = ({ destination, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<TourDestination['category']>(categories[0]);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (destination) {
            setName(destination.name);
            setCategory(destination.category);
            setDescription(destination.description);
        } else {
            // Reset for new entry
            setName('');
            setCategory(categories[0]);
            setDescription('');
        }
    }, [destination]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description) {
            alert('Please fill out all fields.');
            return;
        }
        onSave({ name, category, description });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">{destination ? 'Edit Destination' : 'Add New Destination'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="dest-name" className="block text-sm font-medium text-gray-700">Destination Name</label>
                            <input type="text" id="dest-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="dest-category" className="block text-sm font-medium text-gray-700">Category</label>
                            {/* Fix: Explicitly type the event to ensure correct type inference for e.target.value */}
                            <select id="dest-category" value={category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as TourDestination['category'])} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="dest-description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="dest-description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Destination</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TourEditorModal;