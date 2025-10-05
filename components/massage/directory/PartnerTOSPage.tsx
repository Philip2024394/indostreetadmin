import React from 'react';
import { Editable } from '../../shared/Editable';
import { ChevronLeftIcon } from '../../shared/Icons';

interface PartnerTOSPageProps {
    onBack: () => void;
}

const PartnerTOSPage: React.FC<PartnerTOSPageProps> = ({ onBack }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800 text-center">
                <Editable editId="partner-tos-title" type="text" defaultValue="Partner Terms of Service" />
            </h2>
            <p className="text-center text-gray-500 mt-1 mb-8">
                 <Editable editId="partner-tos-subtitle" type="text" defaultValue="Agreement for using the IndoStreet Platform as a Service Partner." />
            </p>

            <div className="prose prose-sm max-w-none">
                <h4><Editable editId="partner-tos-section1-title" type="text" defaultValue="1. Relationship of Parties" /></h4>
                <p><Editable editId="partner-tos-section1-content" type="text" defaultValue="You acknowledge and agree that you are an independent, self-employed professional. Your partnership with IndoStreet is solely for the purpose of using the platform as a directory to gain traffic and connect with potential customers. This agreement does not create an employment, agency, or joint venture relationship between you and IndoStreet." /></p>
                
                <h4><Editable editId="partner-tos-section2-title" type="text" defaultValue="2. Tax and Government Obligations" /></h4>
                <p><Editable editId="partner-tos-section2-content" type="text" defaultValue="As a self-employed individual or business, you are solely and exclusively responsible for all your tax obligations, including but not limited to income tax, VAT, and any other applicable government fees or levies. IndoStreet is not responsible for withholding, filing, or paying any taxes on your behalf. You agree to indemnify and hold IndoStreet harmless from any claims or liabilities related to your tax and government obligations." /></p>
                
                <h4><Editable editId="partner-tos-section3-title" type="text" defaultValue="3. Platform as a Directory" /></h4>
                <p><Editable editId="partner-tos-section3-content" type="text" defaultValue="IndoStreet operates as a technology platform that serves as a directory to facilitate connections between service partners (like yourself) and customers. IndoStreet is not a provider of massage, transport, or any other service listed. We are not involved in the actual transaction or service delivery between you and the customer. Any disputes, issues, or liabilities arising from your interaction with a customer are your own responsibility." /></p>
                
                <h4><Editable editId="partner-tos-section4-title" type="text" defaultValue="4. Compliance with Laws" /></h4>
                <p><Editable editId="partner-tos-section4-content" type="text" defaultValue="You agree to comply with all local, regional, and national laws and regulations applicable to your services. This includes holding valid licenses, permits, and insurance as required. IndoStreet is not liable for any legal or governmental issues that may arise from your operations." /></p>

                <h4><Editable editId="partner-tos-section5-title" type="text" defaultValue="5. Limitation of Liability" /></h4>
                <p><Editable editId="partner-tos-section5-content" type="text" defaultValue="By joining and using the IndoStreet platform, you agree that IndoStreet's liability is limited to the provision of the directory service. We are not responsible for any damages, losses, or legal issues that may occur as a result of the services you provide or your interactions with customers." /></p>
            </div>
        </div>
    );
};

export default PartnerTOSPage;