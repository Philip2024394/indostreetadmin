import React from 'react';
import { useContent } from '../../contexts/ContentContext';

const SiteContentPage: React.FC = () => {
    const { content, updateText, updateNumber } = useContent();

    const renderSection = (title: string, data: Record<string, string | number>, updater: (id: string, value: any) => void) => {
        if (Object.keys(data).length === 0) return null;
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(data).map(([id, value]) => (
                        <div key={id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 truncate" title={id}>{id}</label>
                            <input
                                type={typeof value === 'number' ? 'number' : 'text'}
                                value={value}
                                onChange={(e) => updater(id, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                                className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <h4 className="font-bold text-yellow-800">Content Management</h4>
                <p className="text-sm text-yellow-700 mt-1">This page lists all content that has been overridden from its default value (e.g., membership prices). To edit new content, enable "Edit Mode" in the header and click on elements directly throughout the application.</p>
            </div>
            {renderSection('Text Overrides', content.text, updateText)}
            {renderSection('Number Overrides', content.numbers, updateNumber)}
            {/* Asset overrides (images) are best managed visually via Edit Mode */}
             {Object.keys(content.assets).length > 0 && (
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Asset Overrides</h3>
                    <p className="text-sm text-gray-600">Custom images and icons are managed visually using "Edit Mode". This section just confirms which assets have been customized.</p>
                     <ul className="list-disc list-inside mt-4 text-sm text-gray-700">
                         {Object.keys(content.assets).map(id => <li key={id}>{id}</li>)}
                     </ul>
                 </div>
             )}

            {Object.keys(content.text).length === 0 && Object.keys(content.numbers).length === 0 && Object.keys(content.assets).length === 0 && (
                <div className="text-center py-10 px-6 text-gray-500 bg-white rounded-lg shadow-md">
                    <p>No content has been customized yet.</p>
                    <p className="text-sm mt-1">Enable "Edit Mode" to start editing.</p>
                </div>
            )}
        </div>
    );
};

export default SiteContentPage;