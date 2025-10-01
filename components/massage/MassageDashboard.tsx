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

interface MassageDashboardProps {
  user: User;
  onLogout: () => void;
}

const MassageDashboard: React.FC<MassageDashboardProps> = ({ user, onLogout }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

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

  if (loading) {
    return (
        <Layout user={user} onLogout={onLogout} title="Loading Dashboard...">
            <div className="text-center p-10">Loading your profile...</div>
        </Layout>
    );
  }

  if (!partner) {
      return (
        <Layout user={user} onLogout={onLogout} title="Error">
            <div className="text-center p-10 text-red-500">Could not load your partner profile. Please try again later.</div>
        </Layout>
      );
  }

  return (
    <Layout user={user} onLogout={onLogout} title={title}>
       <div className="mb-6">
          <MembershipExpiryNotification partner={partner} onRenew={() => setIsRenewalModalOpen(true)} />
       </div>
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
