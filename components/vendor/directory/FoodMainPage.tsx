import React from 'react';
import { Editable } from '../../shared/Editable';

interface FoodMainPageProps {
    onNavigate: (view: 'directory') => void;
}

const FoodMainPage: React.FC<FoodMainPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 text-center">
                <Editable editId="food-main-title" type="text" defaultValue="Food Directory" />
            </h3>
            <p className="text-center text-gray-500 mt-2">
                <Editable editId="food-main-subtitle" type="text" defaultValue="Explore the culinary landscape of Indonesia." />
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6">
                <div 
                    onClick={() => onNavigate('directory')}
                    className="p-6 border rounded-lg hover:shadow-lg hover:border-orange-500 cursor-pointer transition-all"
                >
                    <h4 className="font-semibold text-lg text-orange-700">
                        <Editable editId="food-directory-prompt-text" type="text" defaultValue="What's on the menu?" />
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Explore our directory of popular Indonesian dishes to learn more about them.</p>
                </div>
            </div>
        </div>
    );
};

export default FoodMainPage;
