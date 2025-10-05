import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { VendorItem, Partner, PartnerType } from '../../types';
import { useContent } from '../../contexts/ContentContext';
import FoodItemEditorModal from './FoodItemEditorModal';
import { PlusCircleIcon, PencilIcon, TrashIcon, SearchIcon } from '../shared/Icons';

const FoodDirectoryManagementPage: React.FC = () => {
    const { content, updateText } = useContent();
    const [items, setItems] = useState<VendorItem[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<VendorItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [title, setTitle] = useState(content.text['food-directory-title'] || "IndoStreet Food Directory");
    const [subtitle, setSubtitle] = useState(content.text['food-directory-subtitle'] || "A guide for tourists and locals alike to explore the rich and diverse world of Indonesian street food.");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [itemsData, partnersData] = await Promise.all([
                api.getAllVendorItems(),
                api.getPartners()
            ]);
            setItems(itemsData);
            setPartners(partnersData.filter(p => p.partnerType === PartnerType.FoodVendor));
        } catch (error) {
            console.error("Failed to fetch food directory data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setTitle(content.text['food-directory-title'] || "IndoStreet Food Directory");
        setSubtitle(content.text['food-directory-subtitle'] || "A guide for tourists and locals alike to explore the rich and diverse world of Indonesian street food.");
    }, [content.text]);

    const handleOpenModal = (item: VendorItem | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSaveItem = async (data: Omit<VendorItem, 'id'>, id?: string) => {
        try {
            if (id) {
                await api.updateVendorItem(id, data);
            } else {
                // vendorId is part of data for create
                await api.createVendorItem(data.vendorId, data);
            }
            fetchData();
        } catch (error) {
            console.error("Failed to save item:", error);
        } finally {
            handleCloseModal();
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (window.confirm('Are you sure you want to delete this food item?')) {
            try {
                await api.deleteVendorItem(itemId);
                fetchData();
            } catch (error) {
                console.error("Failed to delete item:", error);
            }
        }
    };
    
    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);
    
    const partnerMap = useMemo(() => new Map(partners.map(p => [p.id, p.profile.shopName || p.profile.name])), [partners]);

    return (
        <>
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Page Headers</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="food-directory-title" className="block text-sm font-medium text-gray-700">Page Title</label>
                            <input
                                id="food-directory-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                onBlur={() => updateText('food-directory-title', title)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="food-directory-subtitle" className="block text-sm font-medium text-gray-700">Page Subtitle</label>
                            <textarea
                                id="food-directory-subtitle"
                                rows={3}
                                value={subtitle}
                                onChange={e => setSubtitle(e.target.value)}
                                onBlur={() => updateText('food-directory-subtitle', subtitle)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Food Directory Items</h3>
                            <p className="text-sm text-gray-500">Manage all food items displayed on the directory page.</p>
                        </div>
                        <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Food Item
                        </button>
                    </div>
                     <div className="p-4 border-b">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="Search by name or category..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? <p className="p-6 text-center text-gray-500">Loading items...</p> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Vendor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredItems.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover mr-4" />
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{item.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{partnerMap.get(item.vendorId) || 'Unknown'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Rp {item.price.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><PencilIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><TrashIcon className="w-5 h-5"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <FoodItemEditorModal
                    item={editingItem}
                    vendors={partners}
                    onClose={handleCloseModal}
                    onSave={handleSaveItem}
                />
            )}
        </>
    );
};

export default FoodDirectoryManagementPage;
