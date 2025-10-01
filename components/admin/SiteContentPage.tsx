import React from 'react';
import { useContent } from '../../contexts/ContentContext';
import { PartnerType } from '../../types';

const slugifyPartnerType = (type: PartnerType): string => type.toLowerCase().replace(/\s+/g, '-');

const MembershipPricingEditor: React.FC = () => {
    const { content, updateNumber } = useContent();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Membership Pricing</h3>
            <div className="space-y-6">
                {Object.values(PartnerType).map(type => {
                    const slug = slugifyPartnerType(type);
                    const price3moKey = `membership-price-${slug}-3mo`;
                    const price6moKey = `membership-price-${slug}-6mo`;
                    const price12moKey = `membership-price-${slug}-12mo`;
                    
                    const price3mo = content.numbers[price3moKey] || 0;
                    const price6mo = content.numbers[price6moKey] || 0;
                    const price12mo = content.numbers[price12moKey] || 0;

                    return (
                        <div key={type} className="p-4 border rounded-lg bg-gray-50/50">
                            <h4 className="font-semibold text-gray-700">{type}</h4>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">3 Months (Rp)</label>
                                    <input
                                        type="number"
                                        value={price3mo}
                                        onChange={(e) => updateNumber(price3moKey, Number(e.target.value))}
                                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">6 Months (Rp)</label>
                                    <input
                                        type="number"
                                        value={price6mo}
                                        onChange={(e) => updateNumber(price6moKey, Number(e.target.value))}
                                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">12 Months (Rp)</label>
                                    <input
                                        type="number"
                                        value={price12mo}
                                        onChange={(e) => updateNumber(price12moKey, Number(e.target.value))}
                                        className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const SiteContentPage: React.FC = () => {
    const { content, updateText, updateNumber } = useContent();

    // Fix: Use Object.keys with reduce for type-safe filtering of the numbers object.
    // This avoids issues with Object.entries where values can be inferred as 'unknown'.
    const otherNumbers: Record<string, number> = Object.keys(content.numbers)
      .filter((key) => !key.startsWith('membership-price-'))
      .reduce<Record<string, number>>((acc, key) => {
        acc[key] = content.numbers[key];
        return acc;
      }, {});

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
                <p className="text-sm text-yellow-700 mt-1">This page allows direct editing of key values. Membership prices can be set below. To edit other content, enable "Edit Mode" in the header and click on elements directly throughout the application.</p>
            </div>
            
            <MembershipPricingEditor />
            
            {renderSection('Text Overrides', content.text, updateText)}
            {renderSection('Other Number Overrides', otherNumbers, updateNumber)}
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

            {Object.keys(content.text).length === 0 && Object.keys(otherNumbers).length === 0 && Object.keys(content.assets).length === 0 && (
                <div className="text-center py-10 px-6 text-gray-500 bg-white rounded-lg shadow-md">
                    <p>No non-membership content has been customized yet.</p>
                    <p className="text-sm mt-1">Enable "Edit Mode" to start editing other site content.</p>
                </div>
            )}
        </div>
    );
};

export default SiteContentPage;