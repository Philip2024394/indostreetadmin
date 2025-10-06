import React, { useState } from 'react';
import { Partner, Room } from '../../types';
import * as api from '../../services/supabase';
import { ChevronLeftIcon, PlusCircleIcon, PencilIcon, TrashIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';
import RoomEditorModal from './RoomEditorModal';

interface RoomManagerProps {
    partner: Partner;
    rooms: Room[];
    onDataRefresh: () => void;
    onBack: () => void;
}

const RoomManager: React.FC<RoomManagerProps> = ({ partner, rooms, onDataRefresh, onBack }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const handleAddNew = () => {
        setEditingRoom(null);
        setIsModalOpen(true);
    };

    const handleEdit = (room: Room) => {
        setEditingRoom(room);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setEditingRoom(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data: Omit<Room, 'id' | 'vendorId'>) => {
        try {
            if (editingRoom) {
                await api.updateRoom(editingRoom.id, data);
            } else {
                await api.createRoom(partner.id, data);
            }
            onDataRefresh();
        } catch (error) {
            console.error("Failed to save room:", error);
            alert("An error occurred. Please try again.");
        } finally {
            handleCloseModal();
        }
    };
    
    const handleDelete = async (roomId: string) => {
        if (window.confirm('Are you sure you want to delete this room? This cannot be undone.')) {
            try {
                await api.deleteRoom(roomId);
                onDataRefresh();
            } catch (error) {
                console.error("Failed to delete room:", error);
                alert("An error occurred. Please try again.");
            }
        }
    };
    
    const handleAvailabilityToggle = async (room: Room, isAvailable: boolean) => {
        try {
            await api.updateRoom(room.id, { isAvailable });
            onDataRefresh();
        } catch (error) {
            console.error("Failed to update room availability:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <>
            <div className="space-y-6">
                <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-2">
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Manage Rooms</h3>
                            <p className="text-sm text-gray-500">Add, edit, and manage availability for your property's rooms.</p>
                        </div>
                        <button onClick={handleAddNew} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add New Room
                        </button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Night</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rooms.length > 0 ? rooms.map(room => (
                                    <tr key={room.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img src={room.mainImage} alt={room.name} className="w-16 h-12 rounded-md object-cover mr-4"/>
                                                <span className="font-medium text-gray-900">{room.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Rp {room.pricePerNight.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <ToggleSwitch enabled={room.isAvailable} onChange={(val) => handleAvailabilityToggle(room, val)} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleEdit(room)} className="p-2 text-gray-500 hover:text-orange-600 rounded-full hover:bg-gray-100"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(room.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-gray-500">No rooms have been added yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {isModalOpen && (
                <RoomEditorModal 
                    room={editingRoom}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default RoomManager;
