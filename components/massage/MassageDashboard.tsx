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

interface MassageDashboardProps {
  user: User;
  onLogout: () => void;
}

const MassageDashboard: React.FC<MassageDashboardProps> = ({ user, onLogout }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'info'>('dashboard');

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

  const renderDashboardContent = () => {
    if (loading) {
        return <div className="text-center p-10">Loading your profile...</div>;
    }

    if (!partner) {
        return <div className="text-center p-10 text-red-500">Could not load your partner profile. Please try again later.</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <StatusControl partner={partner} onUpdate={handleUpdatePartner} />
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
  };
  
  return (
    <Layout user={user} onLogout={onLogout} title={title}>
       <div className="mb-6">
          <MembershipExpiryNotification partner={partner} onRenew={() => setIsRenewalModalOpen(true)} />
       </div>

        <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
                <button
                    onClick={() => setView('dashboard')}
                    className={`${view === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                >
                    My Dashboard
                </button>
                <button
                    onClick={() => setView('info')}
                    className={`${view === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                >
                    Massage Info & TOS
                </button>
            </nav>
        </div>

        {view === 'dashboard' ? renderDashboardContent() : <MassageMainPage />}

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
