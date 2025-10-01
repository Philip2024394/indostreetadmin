import React from 'react';
import { RoomPhoto } from '../../types';
import { blobToBase64 } from '../shared/Editable';
import { XIcon } from '../shared/Icons';

interface PhotoGalleryManagerProps {
    photos: RoomPhoto[];
    setPhotos: React.Dispatch<React.SetStateAction<RoomPhoto[]>>;
}

const PhotoGalleryManager: React.FC<PhotoGalleryManagerProps> = ({ photos, setPhotos }) => {
    
    const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const dataUrl = `data:${file.type};base64,${await blobToBase64(file)}`;
            setPhotos(prev => [...prev, { url: dataUrl, name: '' }]);
        }
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleCaptionChange = (index: number, caption: string) => {
        setPhotos(prev => prev.map((photo, i) => i === index ? { ...photo, name: caption } : photo));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">Property Photo Gallery</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                    <div key={index} className="group relative border rounded-md p-2 space-y-2">
                        <img src={photo.url} alt={photo.name || 'Property photo'} className="w-full h-24 object-cover rounded-md" />
                        <input
                            type="text"
                            placeholder="Add a caption..."
                            value={photo.name}
                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-1 text-xs"
                        />
                         <button onClick={() => handleRemovePhoto(index)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                
                <label className="cursor-pointer flex items-center justify-center w-full h-full min-h-[140px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500">
                    <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="mt-1 block text-sm text-gray-600">Add Photo</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAddPhoto} />
                </label>
            </div>
        </div>
    );
};

export default PhotoGalleryManager;
