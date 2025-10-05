import React, { useState, useEffect } from 'react';
import { User, Role, PartnerType } from './types';
import LoginPage from './components/auth/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import DriverDashboard from './components/driver/DriverDashboard';
import VendorDashboard from './components/vendor/VendorDashboard';
import MassageDashboard from './components/massage/MassageDashboard';
import LodgingDashboard from './components/lodging/LodgingDashboard';
import JeepDashboard from './components/jeep/JeepDashboard';
import AgentDashboard from './components/agent/AgentDashboard';
import * as api from './services/supabase';
import { ContentProvider } from './contexts/ContentContext';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for an active session on initial load and listen for auth changes
  useEffect(() => {
    setLoading(true);
    
    // Check initial session
    api.checkSession().then(user => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout)
    const subscription = api.supabase?.auth.onAuthStateChange(async (event, session) => {
        const currentUser = await api.checkSession();
        setUser(currentUser);
    })?.data?.subscription;

    return () => {
        subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case Role.Agent:
        return <AgentDashboard user={user} onLogout={handleLogout} />;
      case Role.Driver:
        if (user.partnerType === PartnerType.JeepTourOperator) {
            return <JeepDashboard user={user} onLogout={handleLogout} />;
        }
        return <DriverDashboard user={user} onLogout={handleLogout} />;
      case Role.Vendor:
        const isMassagePartner = user.partnerType === PartnerType.MassageTherapist || user.partnerType === PartnerType.MassagePlace;
        if (isMassagePartner) {
            return <MassageDashboard user={user} onLogout={handleLogout} />;
        }
        return <VendorDashboard user={user} onLogout={handleLogout} />;
      case Role.LodgingPartner:
        return <LodgingDashboard user={user} onLogout={handleLogout} />;
      default:
        // In a real app, you might want a more robust fallback or error page
        return <p>Unknown user role. Please contact support.</p>;
    }
  };

  return (
    <ContentProvider>
      <div className="min-h-screen bg-gray-100">
        {user ? renderDashboard() : <LoginPage onLogin={handleLogin} />}
      </div>
    </ContentProvider>
  );
};

export default App;
