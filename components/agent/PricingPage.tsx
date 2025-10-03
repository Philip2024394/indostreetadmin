import React from 'react';
import { useContent } from '../../contexts/ContentContext';
import { PartnerType } from '../../types';

const slugifyPartnerType = (type: PartnerType): string => type.toLowerCase().replace(/\s+/g, '-');

const PricingPage: React.FC = () => {
    const { content, loadingContent } = useContent();
    const agentCommissionRate = 0.10; // 10% - This would come from the agent's profile in a real app

    if (loadingContent) {
        return <p>Loading pricing information...</p>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Membership Pricing & Your Commission</h3>
            <p className="text-sm text-gray-500 mb-4">All prices are set by the administrator. Your commission is calculated based on the price of the package sold.</p>

            <div className="space-y-6">
                {Object.values(PartnerType).map(type => {
                    const slug = slugifyPartnerType(type);
                    const price3mo = content.numbers[`membership-price-${slug}-3mo`] || 0;
                    const price6mo = content.numbers[`membership-price-${slug}-6mo`] || 0;
                    const price12mo = content.numbers[`membership-price-${slug}-12mo`] || 0;

                    return (
                        <div key={type} className="p-4 border rounded-lg bg-gray-50/50">
                            <h4 className="font-semibold text-gray-700">{type}</h4>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                               <PriceCard months={3} price={price3mo} commission={price3mo * agentCommissionRate} />
                               <PriceCard months={6} price={price6mo} commission={price6mo * agentCommissionRate} />
                               <PriceCard months={12} price={price12mo} commission={price12mo * agentCommissionRate} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PriceCard: React.FC<{ months: number, price: number, commission: number }> = ({ months, price, commission }) => (
    <div className="p-3 border rounded-md bg-white">
        <p className="font-bold text-gray-800">{months} Months</p>
        <p className="text-lg font-semibold text-blue-600">Rp {price.toLocaleString('id-ID')}</p>
        <p className="text-sm text-green-700 font-medium mt-1">Your Commission: Rp {commission.toLocaleString('id-ID')}</p>
    </div>
);

export default PricingPage;
