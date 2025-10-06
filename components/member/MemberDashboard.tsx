import React from 'react';
import { User } from '../../types';
import Layout from '../shared/Layout';

interface MemberDashboardProps {
  user: User;
  onLogout: () => void;
}

const MemberDashboard: React.FC<MemberDashboardProps> = ({ user, onLogout }) => {
  return (
    <Layout user={user} onLogout={onLogout} title="Member Dashboard">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800">Welcome, {user.profile.name}!</h3>
        <p className="text-gray-600 mt-2">Your member account is active. This dashboard is currently under construction.</p>
      </div>
    </Layout>
  );
};

export default MemberDashboard;
