

import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/supabase';
import { DrawerConfig, DrawerCategory, DrawerItem } from '../../types';
import { iconMap, iconNames } from '../shared/Icons';
import { PlusCircleIcon, PencilIcon, TrashIcon, XIcon, CheckIcon, DocumentTextIcon } from '../shared/Icons';

const DrawerConfigPage: React.FC = () => {
    const [config, setConfig] = useState<DrawerConfig>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getDrawerConfig();
            setConfig(data);
        } catch (e: any) {
            setError(`Failed to load config: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await api.updateDrawerConfig(config);
        } catch (e: any) {
            setError(`Failed to save config: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };
    
    const addCategory = () => {
        const name = prompt("Enter new category name:");
        if (name) {
            setConfig(prev => [...prev, { id: Date.now().toString(), name, items: [] }]);
        }
    };

    const deleteCategory = (catId: string) => {
        if (window.confirm("Are you sure you want to delete this category and all its items?")) {
            setConfig(prev => prev.filter(c => c.id !== catId));
        }
    };

    const addItem = (catId: string) => {
        const name = prompt("Enter new item name:");
        if (name) {
            const newItem: DrawerItem = { id: Date.now().toString(), name, icon: 'DocumentTextIcon', link: '#' };
            setConfig(prev => prev.map(c => c.id === catId ? { ...c, items: [...c.items, newItem] } : c));
        }
    };
    
    const updateItem = (catId: string, itemId: string, updatedItem: DrawerItem) => {
        setConfig(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? updatedItem : i) } : c));
    };

    const deleteItem = (catId: string, itemId: string) => {
        setConfig(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
    };


    if (loading) return <p>Loading drawer configuration...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-6">
             <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Side Drawer Configuration</h3>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300">
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            
            {config.map(category => (
                <div key={category.id} className="bg-white rounded-lg shadow-md">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h4 className="font-bold text-gray-700">{category.name}</h4>
                        <button onClick={() => deleteCategory(category.id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="divide-y">
                        {category.items.map(item => (
                            <ItemRow key={item.id} item={item} onUpdate={(updated) => updateItem(category.id, item.id, updated)} onDelete={() => deleteItem(category.id, item.id)}/>
                        ))}
                    </div>
                     <div className="p-4">
                        <button onClick={() => addItem(category.id)} className="flex items-center text-sm text-orange-600 font-medium hover:text-orange-800">
                            <PlusCircleIcon className="w-5 h-5 mr-1"/> Add Item to this Category
                        </button>
                    </div>
                </div>
            ))}

            <button onClick={addCategory} className="w-full p-4 bg-white rounded-lg shadow-md text-center text-orange-600 font-bold hover:bg-orange-50">
                + Add New Category
            </button>
        </div>
    );
};

interface ItemRowProps {
    item: DrawerItem;
    onUpdate: (item: DrawerItem) => void;
    onDelete: () => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(item);

    const IconComponent = iconMap[editData.icon] || DocumentTextIcon;

    if (!isEditing) {
        return (
             <div className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-gray-500"/>
                    <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.link}</p>
                    </div>
                </div>
                <div className="space-x-2">
                    <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-orange-600"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 bg-orange-50 border-2 border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputField label="Name" value={editData.name} onChange={val => setEditData(p => ({...p, name: val}))} />
                 <InputField label="Link/URL" value={editData.link} onChange={val => setEditData(p => ({...p, link: val}))} />
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Icon</label>
                    <select value={editData.icon} onChange={e => setEditData(p => ({...p, icon: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                 </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => setIsEditing(false)} className="p-2 text-gray-500 hover:text-gray-800"><XIcon className="w-5 h-5"/></button>
                <button onClick={() => { onUpdate(editData); setIsEditing(false); }} className="p-2 text-green-500 hover:text-green-700"><CheckIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input value={value} onChange={e => onChange(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
    </div>
);


export default DrawerConfigPage;