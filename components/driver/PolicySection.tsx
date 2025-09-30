import React from 'react';
import { DocumentTextIcon, UserCircleIcon, CarIcon, MotorcycleIcon, CheckCircleIcon } from '../shared/Icons';

interface PolicySectionProps {
  type: 'car' | 'bike' | 'lorry';
}

const PolicySection: React.FC<PolicySectionProps> = ({ type }) => {
  const commonDocs = [
    'Indonesian electronic identity card (e-KTP)',
    'Certificate of Vehicle Registration (STNK)',
    'Police Clearance Letter (SKCK)',
    'Active Bank Account details for payments',
  ];

  const bikeDocs = ['Valid Driving License (SIM C or SIM D)'];
  const carDocs = ['Valid Driving License (SIM A)'];
  const lorryDocs = ['Valid Driving License (SIM B1 or B2)', 'Vehicle Inspection Certificate (KIR)'];

  const personalReqs = [
    'Must be an Indonesian citizen',
    'Age between 18 and 65 years old',
    'Own an Android smartphone with an active number',
  ];

  const bikeVehicleReqs = [
    'Vehicle is a maximum of 8 years old',
    'Four-stroke engine with max 250cc size',
    'Not a trail, sport, or touring model',
  ];

  const carVehicleReqs = [
    'Vehicle is a maximum of 8 years old',
  ];

  const lorryVehicleReqs = [
    'Vehicle is a maximum of 10 years old',
    'Complies with load capacity regulations',
  ];

  const documents = [...commonDocs, ...(type === 'bike' ? bikeDocs : type === 'car' ? carDocs : lorryDocs)];
  const vehicleReqs = type === 'bike' ? bikeVehicleReqs : type === 'car' ? carVehicleReqs : lorryVehicleReqs;

  const RequirementList: React.FC<{ items: string[] }> = ({ items }) => (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700">{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Partner Requirements</h4>
      <div className="space-y-6">
        <div>
          <h5 className="font-semibold text-gray-700 flex items-center mb-2">
            <DocumentTextIcon className="w-5 h-5 mr-2" /> Required Documents
          </h5>
          <RequirementList items={documents} />
        </div>
        <div>
          <h5 className="font-semibold text-gray-700 flex items-center mb-2">
            <UserCircleIcon className="w-5 h-5 mr-2" /> Personal Requirements
          </h5>
          <RequirementList items={personalReqs} />
        </div>
        <div>
          <h5 className="font-semibold text-gray-700 flex items-center mb-2">
            {type === 'bike' ? <MotorcycleIcon className="w-5 h-5 mr-2" /> : <CarIcon className="w-5 h-5 mr-2" />} Vehicle Requirements
          </h5>
          <RequirementList items={vehicleReqs} />
        </div>
      </div>
    </div>
  );
};

export default PolicySection;