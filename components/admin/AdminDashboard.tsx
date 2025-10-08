
import React, { useState } from 'react';
import { User } from '../../types';
import Layout from '../shared/Layout';
import TourManagementPage from './TourManagementPage';
import MassageDirectoryManagementPage from './MassageDirectoryManagementPage';
import FoodDirectoryManagementPage from './FoodDirectoryManagementPage';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type AdminView = 'foodDirectory' | 'massageDirectory' | 'tours';


const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [view, setView] = useState<AdminView>('foodDirectory');

  const handleViewChange = (newView: string) => {
    setView(newView as AdminView);
  }

  const getTitle = () => {
    switch(view) {
        case 'foodDirectory': return 'Food Directory Management';
        case 'massageDirectory': return 'Massage Directory Management';
        case 'tours': return 'Destination Management';
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
    </Layout>
  );
};

export default AdminDashboard;