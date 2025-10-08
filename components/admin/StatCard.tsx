
import React from 'react';

interface StatCardProps {
  title: React.ReactNode;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;