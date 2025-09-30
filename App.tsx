
import React, { useState, useEffect } from 'react';
import { User, Role } from './types';
import LoginPage from './components/auth/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import DriverDashboard from './components/driver/DriverDashboard';
import VendorDashboard from './components/vendor/VendorDashboard';
import { supabase, MOCK_USERS } from './services/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // A mock session check
  useEffect(() => {
    // In a real app, you would check for an active session here.
    // We will just set loading to false after a short delay.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleSwitchRole = (newRole: Role) => {
    const newUser = MOCK_USERS.find(u => u.role === newRole);
    if (newUser) {
      setUser(newUser);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-semibold">Loading Portal...</span>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case Role.Admin:
        return <AdminDashboard user={user} onLogout={handleLogout} onSwitchRole={handleSwitchRole} />;
      case Role.Driver:
        return <DriverDashboard user={user} onLogout={handleLogout} onSwitchRole={handleSwitchRole} />;
      case Role.Vendor:
        return <VendorDashboard user={user} onLogout={handleLogout} onSwitchRole={handleSwitchRole} />;
      default:
        return <p>Unknown user role.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? renderDashboard() : <LoginPage onLogin={handleLogin} />}
    </div>
  );
};

export default App;