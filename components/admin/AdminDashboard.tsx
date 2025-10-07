import React, { useState } from 'react';
import { User } from '../../types';
import Layout from '../shared/Layout';
import BroadcastMessageModal from './BroadcastMessageModal';
import TourManagementPage from './TourManagementPage';
import SiteContentPage from './SiteContentPage';
import MassageDirectoryManagementPage from './MassageDirectoryManagementPage';
import FoodDirectoryManagementPage from './FoodDirectoryManagementPage';
import { PaperAirplaneIcon } from '../shared/Icons';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type AdminView = 'foodDirectory' | 'massageDirectory' | 'tours' | 'siteContent' | 'communications';

const CommunicationsPage: React.FC<{ onBroadcast: () => void }> = ({ onBroadcast }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
            <PaperAirplaneIcon className="w-6 h-6 mr-3 text-orange-500" />
            Communications
        </h3>
        <p className="text-sm text-gray-500 mb-6">Send messages to partners.</p>
        <button
            onClick={onBroadcast}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
            Broadcast Message to All Partners
        </button>
    </div>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [view, setView] = useState<AdminView>('foodDirectory');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const handleViewChange = (newView: string) => {
    setView(newView as AdminView);
  }

  const getTitle = () => {
    switch(view) {
        case 'foodDirectory': return 'Food Directory Management';
        case 'massageDirectory': return 'Massage Directory Management';
        case 'tours': return 'Destination Management';
        case 'siteContent': return 'Site Content Management';
        case 'communications': return 'Communications';
        default: return 'Admin Dashboard';
    }
  };

  const renderContent = () => {
    switch (view) {
        case 'foodDirectory':
            return <FoodDirectoryManagementPage />;
        case 'massageDirectory':
            return <MassageDirectoryManagementPage />;
        case 'tours':
            return <TourManagementPage />;
        case 'siteContent':
            return <SiteContentPage />;
        case 'communications':
            return <CommunicationsPage onBroadcast={() => setIsBroadcastModalOpen(true)} />;
        default:
            return (
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800">Welcome, Admin!</h3>
                    <p className="mt-2 text-gray-600">Please select a management section from the sidebar.</p>
                </div>
            );
    }
  }

  return (
    <Layout 
      user={user} 
      onLogout={onLogout} 
      title={getTitle()}
      currentView={view}
      onViewChange={handleViewChange}
    >
      {renderContent()}
      {isBroadcastModalOpen && <BroadcastMessageModal onClose={() => setIsBroadcastModalOpen(false)} />}
    </Layout>
  );
};

export default AdminDashboard;
