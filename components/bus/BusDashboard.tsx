import React, { useState, useEffect, useCallback } from 'react';
import { User, Vehicle, Partner, VehicleType } from '../../types';
import * as api from '../../services/supabase';
import Layout from '../shared/Layout';
import ProfileManagement from '../shared/ProfileManagement';
import VehicleFormModal from '../admin/VehicleFormModal';
import { RealCarIcon, PlusCircleIcon, PencilIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

interface BusDashboardProps {
  user: User;
  onLogout: () => void;
}

const BusDashboard: React.FC<BusDashboardProps> = ({ user, onLogout }) => {
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
      setVehicles(allVehicles.filter(v => v.partnerId === user.id && v.type === VehicleType.Bus)); // Filter for buses
    } catch (error) {
      console.error("Failed to fetch Bus partner data:", error);
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
        const payload = {...data, partnerId: user.id, type: VehicleType.Bus }; // Enforce Bus type
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
            <h3 className="text-xl font-semibold text-gray-800">My Bus Fleet</h3>
            <p className="text-sm text-gray-500">Manage your buses for rental and sale.</p>
        </div>
         <button onClick={() => { setEditingVehicle(null); setIsFormOpen(true); }} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Add Bus
        </button>
       </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(v => (
                <div key={v.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                    <img src={v.driverImage} alt={v.name} className="w-full h-40 object-cover" />
                    <div className="p-4 flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{v.name}</h4>
                            <p className="text-sm text-gray-600">{v.plate}</p>
                          </div>
                          <span className="text-xs font-semibold uppercase px-2 py-1 rounded-full bg-blue-100 text-blue-800">{v.listingType}</span>
                        </div>

                        <div className="mt-2 text-sm space-y-1">
                          {(v.listingType === 'rent' || v.listingType === 'both') && v.pricePerDay && (
                            <p><strong>Rental:</strong> Rp {v.pricePerDay.toLocaleString('id-ID')}/day</p>
                          )}
                          {(v.listingType === 'sale' || v.listingType === 'both') && v.salePrice && (
                            <p><strong>Sale Price:</strong> Rp {v.salePrice.toLocaleString('id-ID')}</p>
                          )}
                        </div>
                    </div>
                     <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                        <ToggleSwitch enabled={v.isAvailable} onChange={() => {}} enabledText="Available" disabledText="Unavailable" />
                         <button onClick={() => handleEditVehicle(v)} className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700">
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Edit
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
            <p className="text-gray-600">Manage your bus rental and sales operations from here.</p>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <h4 className="font-semibold text-lg">Active Fleet</h4>
                <p className="text-3xl font-bold text-orange-600 my-2">{vehicles.length}</p>
                 <button onClick={() => setView('fleet')} className="text-sm text-orange-600 hover:underline">Manage My Fleet</button>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <h4 className="font-semibold text-lg">Booking Inquiries Today</h4>
                <p className="text-3xl font-bold text-orange-600 my-2">3</p>
                <p className="text-sm text-gray-500">(Mock Data)</p>
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

  const title = view === 'fleet' ? 'My Bus Fleet' : view === 'profile' ? 'My Profile' : 'Bus Partner Dashboard';

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

export default BusDashboard;