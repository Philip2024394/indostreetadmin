import React, { useState, useEffect } from 'react';
import * as api from '../../../services/supabase';
import { FoodType, FoodTypeCategory } from '../../../types';
import { Editable } from '../../shared/Editable';
import { ChevronLeftIcon } from '../../shared/Icons';

interface FoodDirectoryPageProps {
    onBack: () => void;
}

const FoodDirectoryPage: React.FC<FoodDirectoryPageProps> = ({ onBack }) => {
    const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await api.getFoodTypes();
                // Filter for enabled types for public view
                setFoodTypes(data.filter(t => t.isEnabled !== false));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const grouped = foodTypes.reduce((acc, type) => {
        (acc[type.category] = acc[type.category] || []).push(type);
        return acc;
    }, {} as Record<FoodTypeCategory, FoodType[]>);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800 text-center">
                <Editable editId="food-directory-title" type="text" defaultValue="IndoStreet Food Directory" />
            </h2>
            <p className="text-center text-gray-500 mt-1 mb-8">
                <Editable editId="food-directory-subtitle" type="text" defaultValue="A guide to explore the rich and diverse world of Indonesian street food." />
            </p>

            {loading ? <p>Loading...</p> : (
                <div className="space-y-10">
                    {Object.values(FoodTypeCategory).map(category => {
                        if (grouped[category] && grouped[category].length > 0) {
                            return (
                                <FoodCategorySection
                                    key={category}
                                    title={<Editable editId={`food-directory-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}-header`} type="text" defaultValue={category} />}
                                    types={grouped[category]}
                                />
                            );
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
    );
};

const FoodCategorySection: React.FC<{ title: React.ReactNode, types: FoodType[] }> = ({ title, types }) => (
    <div>
        <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">{title}</h3>
        <div className="space-y-6">
            {types.map(type => (
                <div key={type.id} className="md:flex md:space-x-6">
                    <img src={type.imageUrl} alt={type.name} className="w-full md:w-48 h-32 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-grow">
                        <h4 className="font-bold text-lg text-gray-800 mt-2 md:mt-0">{type.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        <div className="mt-3">
                            <button
                                onClick={() => alert(`This would show a list of vendors selling ${type.name}.`)}
                                className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Find Vendors
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default FoodDirectoryPage;
