import React from 'react';
import { ShieldCheckIcon, CheckCircleIcon } from '../shared/Icons';

const TipItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <CheckCircleIcon className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
        <span className="text-sm text-gray-700">{children}</span>
    </li>
);

const SafeTradingGuide: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <ShieldCheckIcon className="w-5 h-5 mr-2" />
        Safe Trading Guide
      </h4>
      <ul className="space-y-3">
        <TipItem>
            <strong>Communicate in the app:</strong> Keep all conversations with customers within the IndoStreet chat to have a record.
        </TipItem>
        <TipItem>
            <strong>Confirm payment first:</strong> Never send items or provide services before confirming you have received payment through the official system.
        </TipItem>
        <TipItem>
            <strong>Document your items:</strong> Take clear photos of your items, especially before handing them over for delivery, to prevent disputes.
        </TipItem>
        <TipItem>
            <strong>Be clear with descriptions:</strong> Provide accurate and detailed descriptions of your products or services to manage customer expectations.
        </TipItem>
        <TipItem>
            <strong>Report suspicious activity:</strong> If a customer seems suspicious or asks you to transact outside the app, report them to IndoStreet support immediately.
        </TipItem>
      </ul>
    </div>
  );
};

export default SafeTradingGuide;
