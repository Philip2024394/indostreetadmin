import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { MassageType, MassageTypeCategory } from '../../types';
import MassageTypeEditorModal from './MassageTypeEditorModal';
import { PlusCircleIcon, PencilIcon, TrashIcon, BookOpenIcon } from '../shared/Icons';

const MassageDirectoryManagementPage: React.FC = () => {
    const [massageTypes, setMassageTypes] = useState<MassageType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<MassageType | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getMassageTypes();
            setMassageTypes(data);
        } catch (error) {
            console.error("Failed to fetch massage types:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (type: MassageType | null = null) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingType(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data: Omit<MassageType, 'id'>) => {
        try {
            if (editingType) {
                await api.updateMassageType(editingType.id, data);
            } else {
                await api.createMassageType(data);
            }
            fetchData();
        } catch (error) {
            console.error("Failed to save massage type:", error);
        } finally {
            handleCloseModal();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this massage type?')) {
            try {
                await api.deleteMassageType(id);
                fetchData();
            } catch (error) {
                console.error("Failed to delete massage type:", error);
            }
        }
    };

    const groupedTypes = useMemo(() => {
        const groups: { [key in MassageTypeCategory]?: MassageType[] } = {};
        massageTypes.forEach(type => {
            if (!groups[type.category]) {
                groups[type.category] = [];
            }
            groups[type.category]?.push(type);
        });
        return groups;
    }, [massageTypes]);

    if (loading) {
        return <div className="text-center p-10">Loading massage directory...</div>;
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Manage Massage Directory</h3>
                        <p className="text-sm text-gray-500">Add, edit, or remove massage types shown to users.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Add Massage Type
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    {/* FIX: Use Object.keys for type-safe iteration over the grouped object, preventing 'types' from being inferred as 'unknown'. */}
                    {Object.keys(groupedTypes).map((category) => {
                        const types = groupedTypes[category as MassageTypeCategory];
                        if (!types) return null;
                        return (
                            <div key={category}>
                                <h4 className="text-lg font-bold text-gray-700 mb-3">{category}</h4>
                                <div className="divide-y divide-gray-200 border rounded-md">
                                    {types.map(type => (
                                        <div key={type.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <div className="flex items-center space-x-4">
                                                <img src={type.imageUrl} alt={type.name} className="w-16 h-12 object-cover rounded-md bg-gray-200" />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{type.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1 max-w-xl truncate">{type.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                <button onClick={() => handleOpenModal(type)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(type.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            {isModalOpen && (
                <MassageTypeEditorModal
                    massageType={editingType}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default MassageDirectoryManagementPage;
