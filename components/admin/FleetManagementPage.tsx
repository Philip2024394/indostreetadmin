import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { Vehicle, Zone, VehicleType } from '../../types';
import VehicleFormModal from './VehicleFormModal';
import { PlusCircleIcon, PencilIcon, TrashIcon, SearchIcon, MotorcycleIcon, RealCarIcon } from '../shared/Icons';
import ToggleSwitch from '../shared/ToggleSwitch';

const FleetManagementPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<VehicleType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'busy'>('all');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getVehicles();
            setVehicles(data);
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddNew = () => {
        setEditingVehicle(null);
        setIsFormOpen(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this vehicle and driver profile?')) {
            try {
                await api.deleteVehicle(id);
                fetchData();
            } catch (error) {
                console.error("Failed to delete vehicle:", error);
            }
        }
    };
    
    const handleSave = async (data: Omit<Vehicle, 'id'>, id?: string) => {
        try {
            if (id) {
                await api.updateVehicle(id, data);
            } else {
                await api.createVehicle(data);
            }
            fetchData();
            setIsFormOpen(false);
        } catch (error) {
            console.error("Failed to save vehicle:", error);
        }
    };
    
    const handleStatusToggle = async (vehicle: Vehicle, isAvailable: boolean) => {
        setVehicles(prev => prev.map(v => v.id === vehicle.id ? {...v, isAvailable} : v));
        try {
            await api.updateVehicle(vehicle.id, { isAvailable });
        } catch(e) {
            console.error("Failed to update status", e);
            fetchData();
        }
    };

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v => {
            const searchMatch = searchTerm === '' || 
                v.driver.toLowerCase().includes(searchTerm.toLowerCase()) || 
                v.plate.toLowerCase().includes(searchTerm.toLowerCase());
            
            const typeMatch = typeFilter === 'all' || v.type === typeFilter;

            const statusMatch = statusFilter === 'all' || 
                (statusFilter === 'available' && v.isAvailable) || 
                (statusFilter === 'busy' && !v.isAvailable);

            return searchMatch && typeMatch && statusMatch;
        });
    }, [vehicles, searchTerm, typeFilter, statusFilter]);

    return (
        <>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 sm:p-6 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Fleet Management</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage all registered vehicles and drivers for various services.</p>
                        </div>
                        <button 
                            onClick={handleAddNew}
                            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add New Vehicle
                        </button>
                    </div>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="Search by Driver or Plate..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm"
                            />
                        </div>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="border border-gray-300 rounded-md sm:text-sm py-2">
                            <option value="all">All Vehicle Types</option>
                            {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="border border-gray-300 rounded-md sm:text-sm py-2">
                             <option value="all">All Statuses</option>
                             <option value="available">Available</option>
                             <option value="busy">Busy</option>
                        </select>
                     </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? <p className="p-6 text-center text-gray-500">Loading fleet data...</p> : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver / Vehicle</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {filteredVehicles.length > 0 ? filteredVehicles.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-full" src={v.driverImage} alt={v.driver} />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{v.driver}</div>
                                                    <div className="text-sm text-gray-500">{v.name} ({v.plate})</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                            <span className="flex items-center">
                                                {v.type === VehicleType.Bike ? <MotorcycleIcon className="w-5 h-5 mr-2 text-gray-500" /> : <RealCarIcon className="w-5 h-5 mr-2 text-gray-500" />}
                                                {v.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize hidden lg:table-cell">{v.serviceType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <ToggleSwitch enabled={v.isAvailable} onChange={(enabled) => handleStatusToggle(v, enabled)} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleEdit(v)} className="p-2 text-gray-500 hover:text-orange-600 rounded-full hover:bg-gray-100"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(v.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={7} className="text-center py-10 px-6 text-gray-500">No vehicles found.</td></tr>
                                )}
                             </tbody>
                        </table>
                    )}
                </div>
            </div>
            {isFormOpen && (
                <VehicleFormModal 
                    vehicle={editingVehicle}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default FleetManagementPage;