import React, { useState } from 'react';
import { Editable } from '../shared/Editable';
import MassageDirectoryPage from './directory/MassageDirectoryPage';
import MassageTOSPage from './directory/MassageTOSPage';

const MassageMainPage: React.FC = () => {
    const [view, setView] = useState<'main' | 'directory' | 'tos'>('main');

    if (view === 'directory') {
        return <MassageDirectoryPage onBack={() => setView('main')} />;
    }
    if (view === 'tos') {
        return <MassageTOSPage onBack={() => setView('main')} />;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 text-center">
                <Editable editId="massage-main-title" type="text" defaultValue="Massage & Wellness" />
            </h3>
            <p className="text-center text-gray-500 mt-2">
                <Editable editId="massage-main-subtitle" type="text" defaultValue="Find relaxation and rejuvenation in your area." />
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                    onClick={() => setView('directory')}
                    className="p-6 border rounded-lg hover:shadow-lg hover:border-blue-500 cursor-pointer transition-all"
                >
                    <h4 className="font-semibold text-lg text-blue-700">
                        <Editable editId="massage-directory-prompt-text" type="text" defaultValue="Which massage is right for you?" />
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Explore our directory of massage types to understand their benefits.</p>
                </div>
                <div
                    onClick={() => setView('tos')}
                    className="p-6 border rounded-lg hover:shadow-lg hover:border-red-500 cursor-pointer transition-all"
                >
                     <h4 className="font-semibold text-lg text-red-700">Terms of Service</h4>
                    <p className="text-sm text-gray-600 mt-1">Please read our TOS to ensure a safe and professional experience for everyone.</p>
                </div>
            </div>
        </div>
    );
};

export default MassageMainPage;
