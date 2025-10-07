import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { MassageType, MassageTypeCategory } from '../../types';
import MassageTypeEditorModal from './MassageTypeEditorModal';
import { PlusCircleIcon, PencilIcon, BookOpenIcon, InformationCircleIcon, ExclamationCircleIcon } from '../shared/Icons';
import SqlCopyBlock from '../shared/SqlCopyBlock';
import { useContent } from '../../contexts/ContentContext';
import ToggleSwitch from '../shared/ToggleSwitch';

const MassageDirectoryManagementPage: React.FC = () => {
    const [massageTypes, setMassageTypes] = useState<MassageType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<MassageType | null>(null);
    const { content, updateText, updateNumber } = useContent();
    const [error, setError] = useState<string | null>(null);


    const fullSeedCount = 15; // The total number of massages in the seed script.

    const seedSql = `
-- This script pre-populates the 'massage_types' table with a standard list of common massages.
-- It is safe to run multiple times as it checks for existing entries before inserting.

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Pijat Tradisional (Urut)', 'A traditional Indonesian deep tissue massage using palm pressure and invigorating strokes to relieve muscle tension and improve circulation.', 'https://placehold.co/300x200/f97316/ffffff?text=Pijat', 'Traditional Indonesian Techniques'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Pijat Tradisional (Urut)');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Kerokan (Coin Rub)', 'A folk remedy using a coin to scrape the skin, believed to release "wind" from the body and alleviate cold symptoms. Often followed by a balm application.', 'https://placehold.co/300x200/f97316/ffffff?text=Kerokan', 'Traditional Indonesian Techniques'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Kerokan (Coin Rub)');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Lulur Body Scrub', 'A royal Javanese beauty ritual. A paste of turmeric, rice powder, and spices is applied to exfoliate and soften the skin, followed by a yogurt rub.', 'https://placehold.co/300x200/f97316/ffffff?text=Lulur', 'Traditional Indonesian Techniques'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Lulur Body Scrub');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Totok Wajah (Facial Acupressure)', 'A facial treatment that applies pressure to specific points on the face to improve blood flow, reduce tension, and create a natural facelift effect.', 'https://placehold.co/300x200/f97316/ffffff?text=Totok', 'Traditional Indonesian Techniques'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Totok Wajah (Facial Acupressure)');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Balinese Massage', 'A full-body treatment combining gentle stretches, acupressure, and aromatherapy oils to stimulate blood flow and induce deep relaxation.', 'https://placehold.co/300x200/ea580c/ffffff?text=Balinese', 'Eastern & Indonesian Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Balinese Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Thai Massage', 'An invigorating and dynamic massage that involves assisted yoga postures and stretching to improve flexibility, reduce tension, and boost energy.', 'https://placehold.co/300x200/ea580c/ffffff?text=Thai', 'Eastern & Indonesian Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Thai Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Shiatsu Massage', 'A Japanese finger pressure technique that uses thumbs, fingers, and palms to apply pressure to specific points, promoting energy flow and correcting imbalances.', 'https://placehold.co/300x200/ea580c/ffffff?text=Shiatsu', 'Eastern & Indonesian Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Shiatsu Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Lomi Lomi Massage', 'A traditional Hawaiian massage using long, flowing strokes with the forearms and hands, mimicking the rhythm of ocean waves to soothe and heal.', 'https://placehold.co/300x200/ea580c/ffffff?text=Lomi+Lomi', 'Eastern & Indonesian Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Lomi Lomi Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Swedish Massage', 'A classic Western massage using long, gliding strokes, kneading, and friction on the more superficial layers of muscles. Ideal for relaxation.', 'https://placehold.co/300x200/d97706/ffffff?text=Swedish', 'Western Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Swedish Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Deep Tissue Massage', 'Focuses on realigning deeper layers of muscles and connective tissue. It is especially helpful for chronically tense and contracted areas.', 'https://placehold.co/300x200/d97706/ffffff?text=Deep+Tissue', 'Western Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Deep Tissue Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Aromatherapy Massage', 'A Swedish massage therapy using essential oils derived from plants to affect your mood and alleviate pain, promoting physical and emotional well-being.', 'https://placehold.co/300x200/d97706/ffffff?text=Aromatherapy', 'Western Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Aromatherapy Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Hot Stone Massage', 'Heated, smooth stones are placed on key points of the body. The heat relaxes muscles, allowing the therapist to work deeper without intense pressure.', 'https://placehold.co/300x200/d97706/ffffff?text=Hot+Stone', 'Western Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Hot Stone Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Reflexology', 'Applying pressure to specific points on the feet, hands, and ears. These points correspond to different body organs and systems, promoting health in those areas.', 'https://placehold.co/300x200/b45309/ffffff?text=Reflexology', 'Specialty Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Reflexology');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Sports Massage', 'Specifically designed for people who are involved in physical activity. It focuses on preventing and treating injury and enhancing athletic performance.', 'https://placehold.co/300x200/b45309/ffffff?text=Sports', 'Specialty Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Sports Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Prenatal Massage', 'A gentle massage tailored for the expectant mother''s needs. It is used to improve circulation, reduce swelling, and relieve muscle and joint pain.', 'https://placehold.co/300x200/b45309/ffffff?text=Prenatal', 'Specialty Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Prenatal Massage');
`;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getMassageTypes();
            setMassageTypes(data);
        } catch (error: any) {
            console.error("Failed to fetch massage types:", error);
            setError(`Failed to load data: ${error.message}. Please check your database connection and RLS policies for the 'massage_types' table.`);
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
        } catch (error: any) {
            console.error("Failed to save massage type:", error);
            throw error;
        }
    };

    const handleToggleEnabled = async (type: MassageType, isEnabled: boolean) => {
        // Optimistic update
        setMassageTypes(prev => prev.map(t => t.id === type.id ? { ...t, isEnabled } : t));

        try {
            await api.updateMassageType(type.id, { isEnabled });
        } catch (error: any) {
            console.error("Failed to update massage type status:", error);
            alert(`Failed to update status: ${error.message}`);
            // Revert on failure
            fetchData();
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

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <div className="flex">
                    <div className="py-1">
                        <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-4"/>
                    </div>
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
                <p className="text-sm text-gray-500 mb-4">
                    Turn the entire public massage directory page on or off. When off, users will not be able to access it.
                </p>
                <ToggleSwitch
                    enabled={content.numbers['massage-directory-enabled'] === 1}
                    onChange={(enabled) => updateNumber('massage-directory-enabled', enabled ? 1 : 0)}
                    enabledText="Directory is LIVE"
                    disabledText="Directory is HIDDEN"
                />
            </div>

            <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Page Headers</h3>
                <p className="text-sm text-gray-500 mb-4">Edit the title and subtitle that appear at the top of the public massage directory page.</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="massage-directory-title" className="block text-sm font-medium text-gray-700">Page Title</label>
                        <input
                            id="massage-directory-title"
                            type="text"
                            value={content.text['massage-directory-title'] || "IndoStreet Massage Directory"}
                            onChange={e => updateText('massage-directory-title', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="massage-directory-subtitle" className="block text-sm font-medium text-gray-700">Page Subtitle</label>
                        <textarea
                            id="massage-directory-subtitle"
                            rows={2}
                            value={content.text['massage-directory-subtitle'] || "A guide to help you choose the perfect massage for your needs, from international favorites to local healing traditions."}
                            onChange={e => updateText('massage-directory-subtitle', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {!loading && massageTypes.length < fullSeedCount && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <InformationCircleIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Incomplete Massage Directory</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>It looks like your massage directory is missing the standard list of services. This will cause dropdown menus to be incomplete. To fix this, please copy and run the following SQL script in your Supabase SQL Editor.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <SqlCopyBlock 
                            title="Seed Massage Directory Data"
                            sql={seedSql}
                            sqlId="seed-massage-directory-data-inline"
                        />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Manage Massage Directory</h3>
                        <p className="text-sm text-gray-500">Add, edit, or remove massage types shown to users.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Add Massage Type
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    {Object.values(MassageTypeCategory).map((category) => {
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
                     {massageTypes.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-500">
                            No massage types found in the directory. Use the "Add Massage Type" button or the seed script above to populate it.
                        </div>
                    )}
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