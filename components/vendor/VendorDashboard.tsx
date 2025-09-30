
import React, { useState, useEffect, useCallback } from 'react';
import { User, VendorItem, Role } from '../../types';
import { supabase } from '../../services/supabase';
import Layout from '../shared/Layout';
import ToggleSwitch from '../shared/ToggleSwitch';

interface VendorDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchRole: (role: Role) => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user, onLogout, onSwitchRole }) => {
  const [items, setItems] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vendor_items').select('*').eq('vendorId', user.id);
    if (data) {
      setItems(data);
    }
    if (error) {
      console.error('Error fetching items:', error);
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  const handleAvailabilityChange = async (itemId: string, isAvailable: boolean) => {
      // Optimistically update UI
      setItems(currentItems => currentItems.map(item => 
          item.id === itemId ? { ...item, isAvailable } : item
      ));

      // Update in backend
      const { error } = await supabase.from('vendor_items').update({ is_available: isAvailable }).eq('id', itemId);
      if (error) {
          console.error('Failed to update item availability:', error);
          // Revert UI on failure
          setItems(currentItems => currentItems.map(item => 
              item.id === itemId ? { ...item, isAvailable: !isAvailable } : item
          ));
      }
  };


  return (
    <Layout user={user} onLogout={onLogout} title={user.profile.shopName || 'Vendor Dashboard'} onSwitchRole={onSwitchRole}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Item Management */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Item Management</h3>
                    <p className="text-sm text-gray-500">Toggle item availability for customers.</p>
                </div>
                {loading ? (
                    <p className="p-6 text-center text-gray-500">Loading items...</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {items.map(item => (
                            <li key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-600">Rp {item.price.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <ToggleSwitch 
                                    enabled={item.isAvailable} 
                                    onChange={(enabled) => handleAvailabilityChange(item.id, enabled)}
                                    enabledText="Available"
                                    disabledText="Out of Stock"
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

        {/* Right Column: Placeholders */}
        <div className="lg:col-span-1 space-y-8">
          {/* Orders Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Orders</h4>
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">New orders will appear here.</p>
            </div>
          </div>
          
          {/* Earnings Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Earnings</h4>
             <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">Earnings data will be available soon.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorDashboard;