import React, { useState, useEffect, useCallback } from 'react';
import { User, VendorItem, Role, Partner } from '../../types';
import { supabase, MOCK_PARTNERS } from '../../services/supabase';
import Layout from '../shared/Layout';
import ToggleSwitch from '../shared/ToggleSwitch';
import ItemEditorModal from './ItemEditorModal';
import LiveOrders from './LiveOrders';
import EarningsAndHistory from './EarningsAndHistory';
import ProfileManagement from '../shared/ProfileManagement';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '../shared/Icons';

interface VendorDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchRole: (role: Role) => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user, onLogout, onSwitchRole }) => {
  const [items, setItems] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VendorItem | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Fetch items
    const { data: itemsData, error } = await supabase.from('vendor_items').select('*').eq('vendorId', user.id);
    if (itemsData) setItems(itemsData);
    if (error) console.error('Error fetching items:', error);
    
    // Fetch partner data
    const currentPartner = MOCK_PARTNERS.find(p => p.id === user.id) || null;
    setPartner(currentPartner);

    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleAvailabilityChange = async (itemId: string, isAvailable: boolean) => {
      setItems(currentItems => currentItems.map(item => 
          item.id === itemId ? { ...item, isAvailable } : item
      ));
      await supabase.from('vendor_items').update({ isAvailable }).eq('id', itemId);
  };
  
  const handleOpenModal = (item: VendorItem | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleSaveItem = async (itemData: Omit<VendorItem, 'id' | 'vendorId'>) => {
    if (editingItem) { // Update
      await supabase.from('vendor_items').update(itemData).eq('id', editingItem.id);
    } else { // Create
      await supabase.from('vendor_items').insert({ ...itemData, vendorId: user.id });
    }
    handleCloseModal();
    fetchData(); // Refresh list
  };
  
  const handleDeleteItem = async (itemId: string) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
        await supabase.from('vendor_items').delete().eq('id', itemId);
        fetchData(); // Refresh list
    }
  };

  const handleUpdatePartner = async (updatedData: Partial<Partner>) => {
      if (!partner) return;
      const { data } = await supabase.from('partners').update(updatedData).eq('id', partner.id);
      if (data) {
          setPartner(data[0]);
      }
  };


  return (
    <Layout user={user} onLogout={onLogout} title={user.profile.shopName || 'Vendor Dashboard'} onSwitchRole={onSwitchRole}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Orders & Item Management */}
        <div className="lg:col-span-2 space-y-8">
            <LiveOrders user={user} />
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Item Management</h3>
                        <p className="text-sm text-gray-500">Add, edit, and manage your item availability.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                                    <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><PencilIcon className="w-5 h-5"/></button>
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
    </Layout>
  );
};

export default VendorDashboard;
