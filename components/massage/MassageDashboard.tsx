import React, { useState, useEffect, useCallback } from 'react';
import { User, Partner, PartnerType } from '../../types';
import * as api from '../../services/supabase';
import Layout from '../shared/Layout';
import MembershipExpiryNotification from '../shared/MembershipExpiryNotification';
import RenewalModal from '../shared/RenewalModal';
import StatusControl from './StatusControl';
import ProfileEditor from './ProfileEditor';
import ServicesEditor from './ServicesEditor';
import PlaceFeaturesEditor from './PlaceFeaturesEditor';
import MassageMainPage from './MassageMainPage';
import PrivateInfoEditor from './PrivateInfoEditor';
import PartnerTOSPage from './directory/PartnerTOSPage';
import LocationControl from './LocationControl';
import { SparklesIcon, UserCircleIcon, InformationCircleIcon, LockClosedIcon } from '../shared/Icons';


interface MassageDashboardProps {
  user: User;
  onLogout: () => void;
}

const MassageDashboard: React.FC<MassageDashboardProps> = ({ user, onLogout }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'profile' | 'info' | 'private-info' | 'partner-tos'>('dashboard');

  const fetchPartnerData = useCallback(async () => {
    setLoading(true);
    try {
        const currentPartner = await api.getPartner(user.id);
        setPartner(currentPartner);
    } catch (error) {
        console.error("Failed to fetch partner data:", error);
    } finally {
        setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);
  
  const handleUpdatePartner = async (updatedData: Partial<Partner>) => {
      if (!partner) return;
      // Optimistic update
      setPartner(p => ({ ...p, ...updatedData } as Partner));
      try {
        const updatedPartner = await api.updatePartner(partner.id, updatedData);
        setPartner(updatedPartner); // Update with response from API
      } catch (error) {
          console.error("Failed to update partner:", error);
          fetchPartnerData(); // Revert on failure
      }
  };

  const title = partner?.profile?.shopName || partner?.profile?.name || 'Massage & Wellness Dashboard';

  const navItems = [
    { view: 'dashboard', label: 'My Status', icon: <SparklesIcon className="w-5 h-5 mr-3" /> },
    { view: 'profile', label: 'Profile & Services', icon: <UserCircleIcon className="w-5 h-5 mr-3" /> },
    { view: 'info', label: 'Massage Info & TOS', icon: <InformationCircleIcon className="w-5 h-5 mr-3" /> },
    { view: 'private-info', label: 'Private Information', icon: <LockClosedIcon className="w-5 h-5 mr-3" /> }
  ];


  const renderDashboardContent = () => {
    if (loading) {
        return <div className="text-center p-10">Loading your profile...</div>;
    }

    if (!partner) {
        return <div className="text-center p-10 text-red-500">Could not load your partner profile. Please try again later.</div>;
    }
    
    if (view === 'partner-tos') {
        return <PartnerTOSPage onBack={() => setView('private-info')} />;
    }

    if (view === 'private-info') {
        return <PrivateInfoEditor partner={partner} onUpdate={handleUpdatePartner} onViewTOS={() => setView('partner-tos')} />;
    }
    
    if (view === 'info') {
        return <MassageMainPage />;
    }

    if (view === 'profile') {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ServicesEditor partner={partner} onUpdate={handleUpdatePartner} />
                    {partner.partnerType === PartnerType.MassagePlace && (
                        <PlaceFeaturesEditor partner={partner} onUpdate={handleUpdatePartner} />
                    )}
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <ProfileEditor partner={partner} onUpdate={handleUpdatePartner} />
                </div>
            </div>
        );
    }

    // Default view is 'dashboard'
    return (
      <div className="space-y-6">
          <StatusControl partner={partner} onUpdate={handleUpdatePartner} />
          <LocationControl partner={partner} onUpdate={handleUpdatePartner} />
      </div>
    );
  };
  
  return (
    <Layout 
        user={user} 
        onLogout={onLogout} 
        title={title}
        navItems={navItems}
        currentView={view}
        onViewChange={setView as (view: string) => void}
    >
       <div className="mb-6">
          <MembershipExpiryNotification partner={partner} onRenew={() => setIsRenewalModalOpen(true)} />
       </div>

        {renderDashboardContent()}

      {isRenewalModalOpen && partner && (
        <RenewalModal
          partner={partner}
          onClose={() => setIsRenewalModalOpen(false)}
          onSuccess={fetchPartnerData}
        />
      )}
    </Layout>
  );
};

export default MassageDashboard;