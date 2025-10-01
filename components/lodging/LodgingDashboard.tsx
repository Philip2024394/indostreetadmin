import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Partner, Room } from '../../types';
import * as api from '../../services/supabase';
import Layout from '../shared/Layout';
import ToggleSwitch from '../shared/ToggleSwitch';
import PropertyProfileEditor from './PropertyProfileEditor';
import AmenitiesEditor from './AmenitiesEditor';
import RoomManager from './RoomManager';
import { CheckCircleIcon, DocumentTextIcon, SparklesIcon, CubeIcon } from '../shared/Icons';

interface LodgingDashboardProps {
  user: User;
  onLogout: () => void;
}

const LodgingDashboard: React.FC<LodgingDashboardProps> = ({ user, onLogout }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'profile' | 'amenities' | 'rooms'>('dashboard');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [partnerData, roomsData] = await Promise.all([
        api.getPartner(user.id),
        api.getRoomsForProperty(user.id)
      ]);
      setPartner(partnerData);
      setRooms(roomsData);
    } catch (error) {
      console.error("Failed to fetch lodging data:", error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdatePartner = async (updatedData: Partial<Partner>) => {
    if (!partner) return;
    setPartner(p => ({ ...p, ...updatedData } as Partner));
    try {
      const updatedPartner = await api.updatePartner(partner.id, updatedData);
      setPartner(updatedPartner);
    } catch (error) {
      console.error("Failed to update partner:", error);
      fetchData(); // Revert
    }
  };
  
  const completionStatus = useMemo(() => {
      if (!partner) return { profile: false, amenities: false, rooms: false, percentage: 0 };
      const profileComplete = !!(partner.description && partner.address && partner.street && partner.photos && partner.photos.length > 0);
      const amenitiesComplete = partner.hotelVillaAmenities && Object.values(partner.hotelVillaAmenities).some(v => v === true);
      const roomsComplete = rooms.length > 0;
      
      const total = 3;
      let completed = 0;
      if (profileComplete) completed++;
      if (amenitiesComplete) completed++;
      if (roomsComplete) completed++;
      
      return {
          profile: profileComplete,
          amenities: amenitiesComplete,
          rooms: roomsComplete,
          percentage: Math.round((completed / total) * 100)
      };
  }, [partner, rooms]);

  const renderContent = () => {
    switch (view) {
      case 'profile':
        return partner && <PropertyProfileEditor partner={partner} onUpdate={handleUpdatePartner} onBack={() => setView('dashboard')} />;
      case 'amenities':
        return partner && <AmenitiesEditor partner={partner} onUpdate={handleUpdatePartner} onBack={() => setView('dashboard')} />;
      case 'rooms':
        return partner && <RoomManager partner={partner} rooms={rooms} onDataRefresh={fetchData} onBack={() => setView('dashboard')} />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Property Status</h3>
                <p className="text-sm text-gray-500">This master switch controls your property's visibility in the app.</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <ToggleSwitch 
                  enabled={partner?.status === 'active'}
                  onChange={(enabled) => handleUpdatePartner({ status: enabled ? 'active' : 'suspended' })}
                  enabledText="Property is Live"
                  disabledText="Property is Offline"
                />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Completion</h3>
               <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${completionStatus.percentage}%` }}></div>
               </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                    <CheckCircleIcon className={`w-5 h-5 mr-2 ${completionStatus.profile ? 'text-green-500' : 'text-gray-400'}`}/>
                    <span>Profile Details</span>
                </div>
                 <div className="flex items-center">
                    <CheckCircleIcon className={`w-5 h-5 mr-2 ${completionStatus.amenities ? 'text-green-500' : 'text-gray-400'}`}/>
                    <span>Amenities</span>
                </div>
                 <div className="flex items-center">
                    <CheckCircleIcon className={`w-5 h-5 mr-2 ${completionStatus.rooms ? 'text-green-500' : 'text-gray-400'}`}/>
                    <span>Rooms Added</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => setView('profile')} className="p-6 bg-white rounded-lg shadow-md text-center hover:shadow-lg hover:ring-2 hover:ring-blue-500 transition-all">
                <DocumentTextIcon className="w-10 h-10 mx-auto text-blue-500" />
                <h4 className="mt-2 font-semibold text-lg">Edit Property Profile</h4>
              </button>
              <button onClick={() => setView('amenities')} className="p-6 bg-white rounded-lg shadow-md text-center hover:shadow-lg hover:ring-2 hover:ring-blue-500 transition-all">
                <SparklesIcon className="w-10 h-10 mx-auto text-blue-500" />
                <h4 className="mt-2 font-semibold text-lg">Manage Amenities</h4>
              </button>
              <button onClick={() => setView('rooms')} className="p-6 bg-white rounded-lg shadow-md text-center hover:shadow-lg hover:ring-2 hover:ring-blue-500 transition-all">
                <CubeIcon className="w-10 h-10 mx-auto text-blue-500" />
                <h4 className="mt-2 font-semibold text-lg">Manage Rooms</h4>
              </button>
            </div>
          </div>
        );
    }
  };

  const title = partner?.profile?.name || 'Lodging Dashboard';

  return (
    <Layout user={user} onLogout={onLogout} title={title}>
      {loading ? <p>Loading your data...</p> : renderContent()}
    </Layout>
  );
};

export default LodgingDashboard;
