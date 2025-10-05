import React, { useState, useEffect } from 'react';
import { TourDestination } from '../../types';
import { XIcon } from '../shared/Icons';
import { blobToBase64 } from '../shared/Editable';

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
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (destination) {
            setName(destination.name);
            setCategory(destination.category);
            setDescription(destination.description);
            setImageUrl(destination.imageUrl || '');
        } else {
            // Reset for new entry
            setName('');
            setCategory(categories[0]);
            setDescription('');
            setImageUrl('');
        }
    }, [destination]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !imageUrl) {
            alert('Please fill out all fields, including the image.');
            return;
        }
        onSave({ name, category, description, imageUrl });
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const dataUrl = `data:${file.type};base64,${await blobToBase64(file)}`;
            setImageUrl(dataUrl);
        }
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
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                        <div>
                            <label htmlFor="dest-image-url" className="block text-sm font-medium text-gray-700">Image</label>
                            <div className="mt-1">
                                <input
                                    id="dest-image-url"
                                    type="text"
                                    placeholder="Enter image URL"
                                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                />
                            </div>
                            <div className="mt-2 text-center text-xs text-gray-500">OR</div>
                            <div className="mt-2">
                                <label className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500">
                                    <div className="space-y-1 text-center">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="Preview" className="mx-auto h-24 max-h-24 w-auto object-contain" />
                                        ) : (
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                <span>Upload a file</span>
                                                <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            </div>
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