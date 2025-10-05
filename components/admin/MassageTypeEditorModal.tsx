import React, { useState, useEffect } from 'react';
import { MassageType, MassageTypeCategory } from '../../types';
import { XIcon } from '../shared/Icons';

interface MassageTypeEditorModalProps {
  massageType: MassageType | null;
  onClose: () => void;
  onSave: (data: Omit<MassageType, 'id'>) => void;
}

const categories = Object.values(MassageTypeCategory);

const MassageTypeEditorModal: React.FC<MassageTypeEditorModalProps> = ({ massageType, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState<MassageTypeCategory>(categories[0]);

    useEffect(() => {
        if (massageType) {
            setName(massageType.name);
            setDescription(massageType.description);
            setImageUrl(massageType.imageUrl);
            setCategory(massageType.category);
        } else {
            setName('');
            setDescription('');
            setImageUrl('');
            setCategory(categories[0]);
        }
    }, [massageType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description, imageUrl, category });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">{massageType ? 'Edit Massage Type' : 'Add New Massage Type'}</h3>
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
                            <select value={category} onChange={(e) => setCategory(e.target.value as MassageTypeCategory)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 sm:text-sm">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image URL</label>
                            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 sm:text-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} className="mt-1 block w-full border border-gray-300 rounded-md p-2 sm:text-sm" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MassageTypeEditorModal;
