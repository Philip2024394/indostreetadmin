import React from 'react';
import { Editable } from '../../shared/Editable';
import { ChevronLeftIcon } from '../../shared/Icons';

interface MassageTOSPageProps {
    onBack: () => void;
}

const MassageTOSPage: React.FC<MassageTOSPageProps> = ({ onBack }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800 text-center">
                <Editable editId="massage-tos-title" type="text" defaultValue="Massage Terms of Service" />
            </h2>
            <p className="text-center text-gray-500 mt-1 mb-8">
                 <Editable editId="massage-tos-subtitle" type="text" defaultValue="Please read carefully to ensure a safe and professional experience." />
            </p>

            <div className="prose prose-sm max-w-none">
                <h4><Editable editId="massage-tos-section1-title" type="text" defaultValue="1. Strictly Professional Service" /></h4>
                <p><Editable editId="massage-tos-section1-content" type="text" defaultValue="All massage services offered on the IndoStreet platform are strictly for therapeutic and relaxation purposes. Any inappropriate requests, suggestions, or actions of a sexual nature are strictly prohibited and will result in an immediate ban from the platform and potential legal action." /></p>
                
                <h4><Editable editId="massage-tos-section2-title" type="text" defaultValue="2. Health and Safety" /></h4>
                <p><Editable editId="massage-tos-section2-content" type="text" defaultValue="You must inform your therapist of any pre-existing medical conditions, allergies, injuries, or any other health concerns before the session begins. This is for your safety and to ensure the therapist can provide the best possible service. Therapists have the right to refuse service if they believe it may be detrimental to your health." /></p>
                
                <h4><Editable editId="massage-tos-section3-title" type="text" defaultValue="3. Punctuality and Cancellations" /></h4>
                <p><Editable editId="massage-tos-section3-content" type="text" defaultValue="Please be ready for your appointment at the scheduled time. Cancellations made less than 2 hours before the scheduled appointment may be subject to a cancellation fee at the discretion of the partner. No-shows will be charged the full amount." /></p>
                
                <h4><Editable editId="massage-tos-section4-title" type="text" defaultValue="4. Privacy and Draping" /></h4>
                <p><Editable editId="massage-tos-section4-content" type="text" defaultValue="You will be properly draped at all times to keep you warm and comfortable. Only the area being worked on will be exposed. Your privacy and comfort are of the utmost importance." /></p>
                
                <h4><Editable editId="massage-tos-section5-title" type="text" defaultValue="5. Environment (For Home Service)" /></h4>
                <p><Editable editId="massage-tos-section5-content" type="text" defaultValue="For home service appointments, please provide a clean, safe, and reasonably quiet space for the massage to take place. The therapist has the right to leave if the environment is deemed unsafe or inappropriate, and the full service fee may be charged." /></p>
                
                <h4><Editable editId="massage-tos-section6-title" type="text" defaultValue="6. Payment" /></h4>
                <p><Editable editId="massage-tos-section6-content" type="text" defaultValue="All payments must be made through the IndoStreet platform. Do not pay therapists directly in cash unless explicitly stated as an option by the partner on their profile." /></p>
                
                <h4><Editable editId="massage-tos-section7-title" type="text" defaultValue="7. Right to Refuse Service" /></h4>
                <p><Editable editId="massage-tos-section7-content" type="text" defaultValue="Our partners have the right to refuse or terminate a session at any point if they feel their safety is compromised, if the client is intoxicated, or if any of the terms of service are violated. The full service fee may apply." /></p>
            </div>
        </div>
    );
};

export default MassageTOSPage;
