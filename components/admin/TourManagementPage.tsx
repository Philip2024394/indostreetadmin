

import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/supabase';
import { TourDestination } from '../../types';
import TourEditorModal from './TourEditorModal';
import { PlusCircleIcon, PencilIcon, TrashIcon, LandmarkIcon, MapPinIcon } from '../shared/Icons';

const TourManagementPage: React.FC = () => {
    const [destinations, setDestinations] = useState<TourDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDestination, setEditingDestination] = useState<TourDestination | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTourDestinations();
            setDestinations(data);
        } catch (error) {
            console.error("Failed to fetch tour destinations:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (destination: TourDestination | null = null) => {
        setEditingDestination(destination);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingDestination(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data: Omit<TourDestination, 'id'>) => {
        try {
            if (editingDestination) { // Update
                await api.updateTourDestination(editingDestination.id, data);
            } else { // Create
                await api.createTourDestination(data);
            }
            fetchData();
        } catch (error) {
            console.error("Failed to save destination:", error);
        } finally {
            handleCloseModal();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
            try {
                await api.deleteTourDestination(id);
                fetchData();
            } catch (error) {
                console.error("Failed to delete destination:", error);
            }
        }
    };

    if (loading) {
        return <div className="text-center p-10">Loading tour destinations...</div>;
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Manage Tour Destinations</h3>
                        <p className="text-sm text-gray-500">Add, edit, or remove tour locations available to drivers.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Add Destination
                    </button>
                </div>

                <div className="divide-y divide-gray-200">
                    {destinations.length > 0 ? destinations.map(dest => (
                        <div key={dest.id} className="p-4 flex items-start justify-between hover:bg-gray-50">
                            <div className="flex items-start space-x-4">
                                {dest.imageUrl ? (
                                    <img src={dest.imageUrl} alt={dest.name} className="w-24 h-16 object-cover rounded-md bg-gray-200 flex-shrink-0" />
                                ) : (
                                    <div className="w-24 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                        <LandmarkIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-800">{dest.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {dest.category}
                                        {dest.touristInfo?.openingHours && (
                                            <span className="ml-2 pl-2 border-l border-gray-300">{dest.touristInfo.openingHours}</span>
                                        )}
                                    </p>
                                    {dest.location?.address && (
                                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                                            <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                            {dest.location.address}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1 max-w-xl">{dest.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <button onClick={() => handleOpenModal(dest)} className="p-2 text-gray-500 hover:text-orange-600 rounded-full hover:bg-gray-100"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDelete(dest.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    )) : (
                         <div className="text-center py-10 px-6 text-gray-500">
                            <p>No tour destinations have been added yet.</p>
                         </div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <TourEditorModal
                    destination={editingDestination}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default TourManagementPage;