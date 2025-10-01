import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Role, RideRequest, PartnerType, Partner } from '../../types';
import * as api from '../../services/supabase';
import Layout from '../shared/Layout';
import ToggleSwitch from '../shared/ToggleSwitch';
import RideRequestCard from './RideRequestCard';
import PolicySection from './PolicySection';
import RateAdjuster from './RateAdjuster';
import EarningsAndHistory from './EarningsAndHistory';
import TourPricing from './TourPricing';
import ProfileManagement from '../shared/ProfileManagement';
import VehicleRentalManagement from './VehicleRentalManagement';
import MembershipExpiryNotification from '../shared/MembershipExpiryNotification';
import RenewalModal from '../shared/RenewalModal';
import { Editable } from '../shared/Editable';
import WeightsDimensionsGuide from './WeightsDimensionsGuide';

interface DriverDashboardProps {
  user: User;
  onLogout: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loadingPartner, setLoadingPartner] = useState(true);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  // Fix: Changed NodeJS.Timeout to number for browser compatibility.
  // The 'setInterval' function in a browser environment returns a number, not a NodeJS.Timeout object.
  const requestInterval = useRef<number | null>(null);

  const fetchPartnerData = useCallback(async () => {
    setLoadingPartner(true);
    try {
        const currentPartner = await api.getPartner(user.id);
        setPartner(currentPartner);
    } catch (error) {
        console.error("Failed to fetch partner data:", error);
    } finally {
        setLoadingPartner(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  const fetchNewRequest = useCallback(async () => {
    try {
        const data = await api.getRideRequests();
        if (data && data.length > 0) {
          const newRequest = { ...data[0], id: `ride-${Date.now()}` }; // Ensure unique ID for list keys
          setRequests(prev => {
            if (prev.find(r => r.pickupLocation === newRequest.pickupLocation && r.destination === newRequest.destination)) {
              return prev; // Avoid adding duplicate requests for demo purposes
            }
            return [newRequest, ...prev].slice(0, 5); // Keep the list from growing indefinitely
          });
        }
    } catch (error) {
        console.error("Failed to fetch ride requests:", error);
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
      // Fetch one immediately
      fetchNewRequest();
      // Then fetch every 7 seconds
      requestInterval.current = setInterval(fetchNewRequest, 7000);
    } else {
      if (requestInterval.current) {
        clearInterval(requestInterval.current);
      }
      setRequests([]); // Clear requests when offline
    }

    return () => {
      if (requestInterval.current) {
        clearInterval(requestInterval.current);
      }
    };
  }, [isOnline, fetchNewRequest]);

  const handleAcceptRequest = (id: string) => {
    console.log(`Accepted request ${id}`);
    setRequests(prev => prev.filter(r => r.id !== id));
    // Here you would typically have more logic, e.g., call an API to accept the ride
  };

  const handleRejectRequest = (id: string) => {
    console.log(`Rejected request ${id}`);
    setRequests(prev => prev.filter(r => r.id !== id));
  };
  
  const handleUpdatePartner = async (updatedData: Partial<Partner>) => {
      if (!partner) return;
      try {
        const updatedPartner = await api.updatePartner(partner.id, updatedData);
        setPartner(updatedPartner);
      } catch (error) {
          console.error("Failed to update partner:", error);
      }
  };

  const getDashboardInfo = () => {
    switch(user.partnerType) {
        case PartnerType.CarDriver:
            return { type: 'car' as const, title: 'Car Driver Dashboard' };
        case PartnerType.LorryDriver:
            return { type: 'lorry' as const, title: 'Lorry Driver Dashboard' };
        case PartnerType.BikeDriver:
        default:
            return { type: 'bike' as const, title: 'Bike Driver Dashboard' };
    }
  };

  const { type: driverType, title: dashboardTitle } = getDashboardInfo();
  
  return (
    <Layout user={user} onLogout={onLogout} title={dashboardTitle}>
       <div className="mb-6">
          <MembershipExpiryNotification partner={partner} onRenew={() => setIsRenewalModalOpen(true)} />
       </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Requests & Availability */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                           <Editable editId={`driver-${driverType}-availability-title`} type="text" defaultValue="Availability" />
                        </h3>
                        <p className="text-sm text-gray-500">Go online to start receiving ride and delivery requests.</p>
                    </div>
                    <ToggleSwitch 
                        enabled={isOnline} 
                        onChange={setIsOnline} 
                        enabledText="Online"
                        disabledText="Offline"
                    />
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                     {isOnline && requests.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500 font-medium">Waiting for requests...</p>
                            <p className="text-sm text-gray-400 mt-1">You will be notified when a new request arrives.</p>
                        </div>
                    )}
                    {requests.map(req => (
                        <RideRequestCard 
                            key={req.id} 
                            request={req}
                            onAccept={handleAcceptRequest}
                            onReject={handleRejectRequest}
                        />
                    ))}
                </div>
            </div>
             {partner?.partnerType === PartnerType.CarDriver && <VehicleRentalManagement partner={partner} onUpdate={handleUpdatePartner} />}
             {partner?.partnerType === PartnerType.CarDriver && <TourPricing partner={partner} onUpdate={handleUpdatePartner} />}
        </div>

        {/* Right Column: Profile, Rates, History */}
        <div className="lg:col-span-1 space-y-8">
          <ProfileManagement partner={partner} onUpdate={handleUpdatePartner} />
          {driverType === 'lorry' ? <WeightsDimensionsGuide /> : <RateAdjuster partner={partner} onUpdate={handleUpdatePartner} />}
          <EarningsAndHistory user={user} />
          {/* <PolicySection type={driverType} /> */}
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

export default DriverDashboard;
