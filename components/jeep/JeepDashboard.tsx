import React, { useState, useEffect, useCallback } from 'react';
import { User, Vehicle, Partner, PartnerType } from '../../types';
import * as api from '../../services/supabase';
import Layout from '../shared/Layout';
import ProfileManagement from '../shared/ProfileManagement';
import VehicleFormModal from '../admin/BikeDriverFormModal';
import { RealCarIcon, PlusCircleIcon, PencilIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

interface JeepDashboardProps {
  user: User;
  onLogout: () => void;
}

const JeepDashboard: React.FC<JeepDashboardProps> = ({ user, onLogout }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'fleet' | 'profile'>('dashboard');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [partnerData, allVehicles] = await Promise.all([
        api.getPartner(user.id),
        api.getVehicles(),
      ]);
      setPartner(partnerData);
      setVehicles(allVehicles.filter(v => v.partnerId === user.id));
    } catch (error) {
      console.error("Failed to fetch Jeep partner data:", error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdatePartner = async (updatedData: Partial<Partner>) => {
    if (!partner) return;
    setPartner(p => ({ ...p!, ...updatedData }));
    try {
      const updated = await api.updatePartner(partner.id, updatedData);
      setPartner(updated);
    } catch (error) {
      console.error("Failed to update partner:", error);
      fetchData(); // Revert
    }
  };
  
  const handleSaveVehicle = async (data: Omit<Vehicle, 'id'>, id?: string) => {
    try {
        const payload = {...data, partnerId: user.id};
        if (id) {
            await api.updateVehicle(id, payload);
        } else {
            await api.createVehicle(payload);
        }
        fetchData();
        setIsFormOpen(false);
    } catch (error) {
        console.error("Failed to save vehicle:", error);
    }
  };
  
  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };
  
  const renderMyFleet = () => (
    <div>
       <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-xl font-semibold text-gray-800">My Fleet Management</h3>
            <p className="text-sm text-gray-500">Manage your Jeeps and their tour packages.</p>
        </div>
         <button onClick={() => { setEditingVehicle(null); setIsFormOpen(true); }} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Add Jeep
        </button>
       </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(v => (
                <div key={v.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img src={v.driverImage} alt={v.name} className="w-full h-40 object-cover" />
                    <div className="p-4">
                        <h4 className="font-bold text-lg">{v.name}</h4>
                        <p className="text-sm text-gray-600">{v.plate}</p>
                        <div className="mt-2">
                             <ToggleSwitch enabled={v.isAvailable} onChange={() => {}} enabledText="Available" disabledText="Unavailable" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end">
                         <button onClick={() => handleEditVehicle(v)} className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700">
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Manage Tours & Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderDashboardHome = () => (
    <div className="space-y-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">Welcome, {partner?.profile.name}!</h3>
            <p className="text-gray-600">Here's a quick look at your operations.</p>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <h4 className="font-semibold text-lg">Overall Status</h4>
                <p className="text-3xl font-bold text-green-600 my-2">Online</p>
                <p className="text-sm text-gray-500">You are visible to customers.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <h4 className="font-semibold text-lg">Booking Inquiries Today</h4>
                <p className="text-3xl font-bold text-orange-600 my-2">5</p>
                <p className="text-sm text-gray-500">(Mock Data)</p>
            </div>
             <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <h4 className="font-semibold text-lg">My Jeeps</h4>
                <p className="text-3xl font-bold text-orange-600 my-2">{vehicles.length}</p>
                 <button onClick={() => setView('fleet')} className="text-sm text-orange-600 hover:underline">Manage My Fleet</button>
            </div>
        </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <p>Loading your dashboard...</p>;
    if (!partner) return <p>Could not load partner data.</p>;

    switch (view) {
        case 'fleet': return renderMyFleet();
        case 'profile': return <ProfileManagement partner={partner} onUpdate={handleUpdatePartner} />;
        case 'dashboard':
        default: return renderDashboardHome();
    }
  }

  const title = view === 'fleet' ? 'My Fleet' : view === 'profile' ? 'My Profile' : 'Jeep Tour Dashboard';

  return (
    <Layout user={user} onLogout={onLogout} title={title}>
      <div className="mb-6 space-x-2">
         <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium ${view === 'dashboard' ? 'bg-orange-500 text-white' : 'bg-white'}`}>Dashboard</button>
         <button onClick={() => setView('fleet')} className={`px-4 py-2 rounded-md text-sm font-medium ${view === 'fleet' ? 'bg-orange-500 text-white' : 'bg-white'}`}>My Fleet</button>
         <button onClick={() => setView('profile')} className={`px-4 py-2 rounded-md text-sm font-medium ${view === 'profile' ? 'bg-orange-500 text-white' : 'bg-white'}`}>Profile & Payouts</button>
      </div>
      {renderContent()}
      
      {isFormOpen && (
        <VehicleFormModal 
            vehicle={editingVehicle}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSaveVehicle}
        />
      )}
    </Layout>
  );
};

export default JeepDashboard;
