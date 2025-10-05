import React, { useState, useEffect } from 'react';
import * as api from '../../../services/supabase';
import { MassageType, MassageTypeCategory } from '../../../types';
import { Editable } from '../../shared/Editable';
import { ChevronLeftIcon } from '../../shared/Icons';

interface MassageDirectoryPageProps {
    onBack: () => void;
}

const MassageDirectoryPage: React.FC<MassageDirectoryPageProps> = ({ onBack }) => {
    const [massageTypes, setMassageTypes] = useState<MassageType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await api.getMassageTypes();
                setMassageTypes(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const grouped = massageTypes.reduce((acc, type) => {
        (acc[type.category] = acc[type.category] || []).push(type);
        return acc;
    }, {} as Record<MassageTypeCategory, MassageType[]>);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800 text-center">
                <Editable editId="massage-directory-title" type="text" defaultValue="IndoStreet Massage Directory" />
            </h2>
            <p className="text-center text-gray-500 mt-1 mb-8">
                 <Editable editId="massage-directory-subtitle" type="text" defaultValue="A guide to help you choose the perfect massage for your needs." />
            </p>

            {loading ? <p>Loading...</p> : (
                <div className="space-y-10">
                    {grouped[MassageTypeCategory.IndonesianTraditional] && (
                        <MassageCategorySection 
                            title={<Editable editId="massage-directory-indonesian-header" type="text" defaultValue="Traditional Indonesian Treatments" />} 
                            types={grouped[MassageTypeCategory.IndonesianTraditional]} 
                        />
                    )}
                     {grouped[MassageTypeCategory.International] && (
                        <MassageCategorySection 
                            title={<Editable editId="massage-directory-international-header" type="text" defaultValue="International Massages" />} 
                            types={grouped[MassageTypeCategory.International]} 
                        />
                    )}
                </div>
            )}
        </div>
    );
};

const MassageCategorySection: React.FC<{ title: React.ReactNode, types: MassageType[] }> = ({ title, types }) => (
    <div>
        <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">{title}</h3>
        <div className="space-y-6">
            {types.map(type => (
                <div key={type.id} className="md:flex md:space-x-6">
                    <img src={type.imageUrl} alt={type.name} className="w-full md:w-48 h-32 object-cover rounded-lg flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 mt-2 md:mt-0">{type.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default MassageDirectoryPage;
