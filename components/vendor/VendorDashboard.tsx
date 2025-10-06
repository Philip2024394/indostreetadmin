import React, { useState, useEffect, useCallback } from 'react';
import { User, VendorItem, Role, Partner } from '../../types';
import * as api from '../../services/supabase';
import Layout from '../shared/Layout';
import ToggleSwitch from '../shared/ToggleSwitch';
import ItemEditorModal from './ItemEditorModal';
import LiveOrders from './LiveOrders';
import EarningsAndHistory from './EarningsAndHistory';
import ProfileManagement from '../shared/ProfileManagement';
import MembershipExpiryNotification from '../shared/MembershipExpiryNotification';
import RenewalModal from '../shared/RenewalModal';
import { Editable } from '../shared/Editable';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '../shared/Icons';
import SafeTradingGuide from './SafeTradingGuide';

interface VendorDashboardProps {
  user: User;
  onLogout: () => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user, onLogout }) => {
  const [items, setItems] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VendorItem | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [itemsData, partnerData] = await Promise.all([
            api.getVendorItems(user.id),
            api.getPartner(user.id),
        ]);
        setItems(itemsData);
        setPartner(partnerData);
    } catch (error) {
        console.error('Error fetching vendor data:', error);
    } finally {
        setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleAvailabilityChange = async (itemId: string, isAvailable: boolean) => {
      setItems(currentItems => currentItems.map(item => 
          item.id === itemId ? { ...item, isAvailable } : item
      ));
      try {
        await api.updateVendorItem(itemId, { isAvailable });
      } catch (error) {
          console.error("Failed to update item availability:", error);
          fetchData(); // Revert optimistic update on failure
      }
  };
  
  const handleOpenModal = (item: VendorItem | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleSaveItem = async (itemData: Omit<VendorItem, 'id' | 'vendorId'>, newImageFile?: File) => {
    try {
        let imageUrl = itemData.imageUrl;
        if (newImageFile) {
            if (editingItem?.imageUrl) {
                // await api.deleteFileByUrl('items', editingItem.imageUrl);
            }
            imageUrl = await api.uploadFile('items', newImageFile);
        }

        const dataToSave = { ...itemData, imageUrl };

        if (editingItem) { // Update
          await api.updateVendorItem(editingItem.id, dataToSave);
        } else { // Create
          await api.createVendorItem(user.id, dataToSave);
        }
        fetchData(); // Refresh list
    } catch (error) {
        console.error("Failed to save item:", error);
    } finally {
        handleCloseModal();
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
        try {
            await api.deleteVendorItem(itemId);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    }
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


  return (
    <Layout user={user} onLogout={onLogout} title={user.profile.shopName || 'Vendor Dashboard'}>
       <div className="mb-6">
          <MembershipExpiryNotification partner={partner} onRenew={() => setIsRenewalModalOpen(true)} />
       </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Orders & Item Management */}
        <div className="lg:col-span-2 space-y-8">
            <LiveOrders user={user} />
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                           <Editable editId="vendor-item-mgmt-title" type="text" defaultValue="Item Management" />
                        </h3>
                        <p className="text-sm text-gray-500">Add, edit, and manage your item availability.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Add Item
                    </button>
                </div>
                {loading ? (
                    <p className="p-6 text-center text-gray-500">Loading items...</p>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {items.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-600">Rp {item.price.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <ToggleSwitch 
                                        enabled={item.isAvailable} 
                                        onChange={(enabled) => handleAvailabilityChange(item.id, enabled)}
                                    />
                                    <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 hover:text-orange-600 rounded-full hover:bg-gray-100"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Profile & Earnings */}
        <div className="lg:col-span-1 space-y-8">
          <ProfileManagement partner={partner} onUpdate={handleUpdatePartner} />
          <SafeTradingGuide />
          <EarningsAndHistory user={user} />
        </div>
      </div>
      
      {isModalOpen && (
        <ItemEditorModal 
            item={editingItem}
            onClose={handleCloseModal}
            onSave={handleSaveItem}
        />
      )}
       {isRenewalModalOpen && partner && (
        <RenewalModal
          partner={partner}
          onClose={() => setIsRenewalModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </Layout>
  );
};

export default VendorDashboard;