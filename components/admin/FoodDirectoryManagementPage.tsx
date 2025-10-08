import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { FoodType, FoodTypeCategory } from '../../types';
import { useContent } from '../../contexts/ContentContext';
import FoodTypeEditorModal from './FoodTypeEditorModal';
import { PlusCircleIcon, PencilIcon, InformationCircleIcon, ExclamationCircleIcon } from '../shared/Icons';
import SqlCopyBlock from '../shared/SqlCopyBlock';
import ToggleSwitch from '../shared/ToggleSwitch';

const FoodDirectoryManagementPage: React.FC = () => {
    const { content, updateText, updateNumber } = useContent();
    const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<FoodType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fullSeedCount = 10;

    const seedSql = `
-- This script pre-populates the 'food_types' table with common Indonesian dishes.
-- It is safe to run multiple times as it checks for existing entries before inserting.

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Nasi Goreng', 'Indonesian fried rice, seasoned with sweet soy sauce, shallots, and tamarind, often served with a fried egg.', 'https://placehold.co/300x200/f97316/ffffff?text=Nasi+Goreng', 'Rice and Noodle Dishes'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Nasi Goreng');

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Mie Goreng', 'Spicy fried noodle dish, common in Indonesia, made with thin yellow noodles fried with garlic, onion, and various seasonings.', 'https://placehold.co/300x200/f97316/ffffff?text=Mie+Goreng', 'Rice and Noodle Dishes'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Mie Goreng');

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Sate Ayam', 'Marinated chicken skewers, grilled over charcoal and served with a rich peanut sauce, shallots, and chili.', 'https://placehold.co/300x200/f97316/ffffff?text=Sate+Ayam', 'Traditional & Regional Dishes'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Sate Ayam');

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Rendang', 'A rich and tender coconut beef stew which is explosively flavorful, originating from the Minangkabau people of Indonesia.', 'https://placehold.co/300x200/f97316/ffffff?text=Rendang', 'Traditional & Regional Dishes'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Rendang');

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Gado-gado', 'An Indonesian salad of slightly boiled or blanched vegetables and hard-boiled eggs, served with a peanut sauce dressing.', 'https://placehold.co/300x200/f97316/ffffff?text=Gado-gado', 'Traditional & Regional Dishes'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Gado-gado');

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Soto Ayam', 'A traditional Indonesian chicken soup with a clear broth, vermicelli, and boiled egg, often served with rice.', 'https://placehold.co/300x200/f97316/ffffff?text=Soto+Ayam', 'Traditional & Regional Dishes'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Soto Ayam');

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Bakso', 'Indonesian meatball soup, typically made from beef, served in a bowl of beef broth with noodles, tofu, and egg.', 'https://placehold.co/300x200/f97316/ffffff?text=Bakso', 'Traditional & Regional Dishes'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Bakso');

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Martabak', 'A stuffed pancake or pan-fried bread which is commonly found in Southeast Asia. Can be sweet or savory.', 'https://placehold.co/300x200/f97316/ffffff?text=Martabak', 'Savory Snacks & Fritters'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Martabak');

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Nasi Padang', 'A miniature banquet of meats, fish, vegetables, and spicy sambals eaten with plain white rice.', 'https://placehold.co/300x200/f97316/ffffff?text=Nasi+Padang', 'Rice and Noodle Dishes'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Nasi Padang');

INSERT INTO public.food_types (name, description, "imageUrl", category)
SELECT 'Kue Lapis', 'A traditional Indonesian layered cake, typically made of rice flour, coconut milk, and sugar.', 'https://placehold.co/300x200/f97316/ffffff?text=Kue+Lapis', 'Drinks & Desserts'
WHERE NOT EXISTS (SELECT 1 FROM public.food_types WHERE name = 'Kue Lapis');
`;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getFoodTypes();
            setFoodTypes(data);
        } catch (error: any) {
            setError(`Failed to load data: ${error.message}. Please check your database connection and RLS policies for the 'food_types' table.`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (type: FoodType | null = null) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingType(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data: Omit<FoodType, 'id'>) => {
        try {
            if (editingType) {
                await api.updateFoodType(editingType.id, data);
            } else {
                await api.createFoodType(data);
            }
            fetchData();
        } catch (error: any) {
            console.error("Failed to save food type:", error);
            throw error;
        }
    };

    const handleToggleEnabled = async (type: FoodType, isEnabled: boolean) => {
        setFoodTypes(prev => prev.map(t => t.id === type.id ? { ...t, isEnabled } : t));
        try {
            await api.updateFoodType(type.id, { isEnabled });
        } catch (error: any) {
            alert(`Failed to update status: ${error.message}`);
            fetchData();
        }
    };

    const groupedTypes = useMemo(() => {
        const groups: { [key in FoodTypeCategory]?: FoodType[] } = {};
        foodTypes.forEach(type => {
            if (!groups[type.category]) {
                groups[type.category] = [];
            }
            groups[type.category]?.push(type);
        });
        return groups;
    }, [foodTypes]);

    if (loading) {
        return <div className="text-center p-10">Loading food directory...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <div className="flex">
                    <div className="py-1"><ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-4"/></div>
                    <div>
                        <p className="font-bold">Data Fetching Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Directory Visibility</h3>
                <p className="text-sm text-gray-500 mb-4">Turn the entire public food directory page on or off.</p>
                <ToggleSwitch
                    enabled={content.numbers['food-directory-enabled'] === 1}
                    onChange={(enabled) => updateNumber('food-directory-enabled', enabled ? 1 : 0)}
                    enabledText="Directory is LIVE"
                    disabledText="Directory is HIDDEN"
                />
            </div>

            <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Page Headers</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Page Title</label>
                        <input
                            type="text"
                            value={content.text['food-directory-title'] || "IndoStreet Food Directory"}
                            onChange={e => updateText('food-directory-title', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Page Subtitle</label>
                        <textarea
                            rows={2}
                            value={content.text['food-directory-subtitle'] || "A guide to explore the rich and diverse world of Indonesian street food."}
                            onChange={e => updateText('food-directory-subtitle', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
            </div>

            {!loading && foodTypes.length < fullSeedCount && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0"><InformationCircleIcon className="h-5 w-5 text-yellow-400" /></div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Incomplete Food Directory</h3>
                            <p className="mt-2 text-sm text-yellow-700">Your directory is missing standard dishes. To fix this, run the SQL script below in your Supabase SQL Editor.</p>
                        </div>
                    </div>
                    <div className="mt-4"><SqlCopyBlock title="Seed Food Directory Data" sql={seedSql} sqlId="seed-food-directory-data" /></div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Manage Food Directory</h3>
                        <p className="text-sm text-gray-500">Add, edit, or toggle visibility for food types shown to users.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                        <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Food Type
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    {Object.values(FoodTypeCategory).map((category) => {
                        const types = groupedTypes[category];
                        if (!types || types.length === 0) return null;
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
                                            <div className="flex items-center space-x-4 flex-shrink-0">
                                                <ToggleSwitch
                                                    enabled={type.isEnabled ?? true}
                                                    onChange={(enabled) => handleToggleEnabled(type, enabled)}
                                                />
                                                <button onClick={() => handleOpenModal(type)} className="p-2 text-gray-500 hover:text-orange-600 rounded-full hover:bg-gray-100"><PencilIcon className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                     {foodTypes.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-500">No food types found in the directory.</div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <FoodTypeEditorModal
                    foodType={editingType}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default FoodDirectoryManagementPage;