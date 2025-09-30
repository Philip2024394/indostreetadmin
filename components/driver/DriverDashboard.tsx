
import React, { useState } from 'react';
import { User, Role } from '../../types';
import Layout from '../shared/Layout';
import ToggleSwitch from '../shared/ToggleSwitch';

interface DriverDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchRole: (role: Role) => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout, onSwitchRole }) => {
  const [isOnline, setIsOnline] = useState(false);
  
  return (
    <Layout user={user} onLogout={onLogout} title="Driver Dashboard" onSwitchRole={onSwitchRole}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Availability */}
        <div className="lg:col-span-1 space-y-8">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img 
              src={user.profile.profilePicture} 
              alt={user.profile.name} 
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-200"
            />
            <h3 className="text-2xl font-bold text-gray-800">{user.profile.name}</h3>
            <p className="text-gray-500">{user.email}</p>
          </div>

          {/* Availability Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Availability Status</h4>
            <div className="flex items-center justify-center p-4 border rounded-lg">
                <ToggleSwitch 
                  enabled={isOnline}
                  onChange={setIsOnline}
                  enabledText="Online"
                  disabledText="Offline"
                />
            </div>
            <p className="text-center text-sm text-gray-500 mt-3">
              You are currently {isOnline ? 'online and ready to receive orders.' : 'offline.'}
            </p>
          </div>
          
           {/* Vehicle Info Card */}
           <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Information</h4>
            <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium text-gray-500">Type:</span> {user.profile.vehicle?.type}</p>
                <p><span className="font-medium text-gray-500">Model:</span> {user.profile.vehicle?.brand} {user.profile.vehicle?.model}</p>
                <p><span className="font-medium text-gray-500">License Plate:</span> {user.profile.vehicle?.licensePlate}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Placeholders */}
        <div className="lg:col-span-2 space-y-8">
          {/* Earnings Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Earnings</h4>
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">Earnings data will be available soon.</p>
            </div>
          </div>
          
          {/* Ride History Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Ride History</h4>
             <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">Your ride history will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DriverDashboard;