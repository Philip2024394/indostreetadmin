import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/supabase';
import { DrawerConfig, DrawerCategory, DrawerItem } from '../../types';
import { iconMap, iconNames } from '../shared/Icons';
import { PlusCircleIcon, PencilIcon, TrashIcon, XIcon, CheckIcon, DocumentTextIcon, ExclamationCircleIcon } from '../shared/Icons';

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input value={value} onChange={e => onChange(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
    </div>
);

const IconPicker: React.FC<{ icon: string; setIcon: (icon: string) => void }> = ({ icon, setIcon }) => {
    const isUrl = !iconMap[icon] && (icon.startsWith('http') || icon.startsWith('data:'));
    const [mode, setMode] = useState<'library' | 'url'>(isUrl ? 'url' : 'library');
    const defaultIcon = 'DocumentTextIcon';

    const handleModeChange = (newMode: 'library' | 'url') => {
        setMode(newMode);
        if (newMode === 'library' && isUrl) {
            setIcon(defaultIcon);
        } else if (newMode === 'url' && !isUrl) {
            setIcon('');
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <div className="mt-1 flex rounded-md">
                <button type="button" onClick={() => handleModeChange('library')} className={`px-3 py-2 text-sm rounded-l-md border border-gray-300 ${mode === 'library' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-100 text-gray-700'}`}>Library</button>
                <button type="button" onClick={() => handleModeChange('url')} className={`-ml-px px-3 py-2 text-sm rounded-r-md border border-gray-300 ${mode === 'url' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-100 text-gray-700'}`}>Custom URL</button>
            </div>
            <div className="mt-2">
                {mode === 'library' ? (
                    <select value={isUrl ? defaultIcon : icon} onChange={e => setIcon(e.target.value)} className="block w-full border border-gray-300 rounded-md p-2">
                        {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                ) : (
                    <input type="url" placeholder="https://example.com/icon.png" value={isUrl ? icon : ''} onChange={e => setIcon(e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                )}
            </div>
        </div>
    );
};


const NewItemForm: React.FC<{ onSave: (item: Omit<DrawerItem, 'id'>) => void; onCancel: () => void; }> = ({ onSave, onCancel }) => {
    const [newItem, setNewItem] = useState<Omit<DrawerItem, 'id'>>({
        name: '',
        link: '',
        icon: 'DocumentTextIcon',
    });

    const handleSave = () => {
        if (newItem.name.trim()) {
            onSave(newItem);
        }
    };

    return (
        <div className="p-4 bg-orange-50 border-t">
            <h5 className="font-bold text-gray-700 mb-2">New Item</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputField label="Name" value={newItem.name} onChange={val => setNewItem(p => ({...p, name: val}))} />
                 <InputField label="Link/URL" value={newItem.link} onChange={val => setNewItem(p => ({...p, link: val}))} />
                 <div className="md:col-span-2">
                    <IconPicker icon={newItem.icon} setIcon={val => setNewItem(p => ({...p, icon: val}))} />
                 </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded-md text-sm">Save Item</button>
            </div>
        </div>
    );
};


const DrawerConfigPage: React.FC = () => {
    const [config, setConfig] = useState<DrawerConfig>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [addingItemToCategory, setAddingItemToCategory] = useState<string | null>(null);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);


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
        setSaved(false);
        setError('');
        try {
            await api.updateDrawerConfig(config);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500); // Show success message for 2.5s
        } catch (e: any) {
            setError(`Failed to save config: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleAddCategory = () => {
        const newCatId = Date.now().toString();
        const newCategory: DrawerCategory = { id: newCatId, name: 'New Category', items: [] };
        setConfig(prev => [...prev, newCategory]);
        setEditingCategoryId(newCatId);
    };

    const deleteCategory = (catId: string) => {
        if (window.confirm("Are you sure you want to delete this category and all its items?")) {
            setConfig(prev => prev.filter(c => c.id !== catId));
            if (editingCategoryId === catId) {
                setEditingCategoryId(null);
            }
            if (addingItemToCategory === catId) {
                setAddingItemToCategory(null);
            }
        }
    };
    
    const handleAddItemToLastCategory = () => {
        setAddingItemToCategory(null); // Close any other open forms first
        if (config.length > 0) {
            const lastCatId = config[config.length - 1].id;
            setAddingItemToCategory(lastCatId);
        } else {
            // No categories exist, create one first, then set it as the target for adding an item
            const newCatId = Date.now().toString();
            const newCategory: DrawerCategory = { id: newCatId, name: 'Main Menu', items: [] };
            setConfig([newCategory]);
            setAddingItemToCategory(newCatId); 
        }
    };

    const handleAddItem = (catId: string, itemData: Omit<DrawerItem, 'id'>) => {
        const newItem: DrawerItem = { id: Date.now().toString(), ...itemData };
        setConfig(prev => prev.map(c => c.id === catId ? { ...c, items: [...c.items, newItem] } : c));
        setAddingItemToCategory(null);
    };
    
    const updateItem = (catId: string, itemId: string, updatedItem: DrawerItem) => {
        setConfig(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? updatedItem : i) } : c));
    };

    const deleteItem = (catId: string, itemId: string) => {
        setConfig(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
    };


    if (loading) return <p>Loading drawer configuration...</p>;

    return (
        <div className="space-y-6">
             <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Side Drawer Configuration</h3>
                <button 
                    onClick={handleSave} 
                    disabled={saving || saved} 
                    className={`px-6 py-2 text-white rounded-md transition-colors duration-300 ${
                        saved ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'
                    } disabled:bg-gray-400`}
                >
                    {saving ? 'Saving...' : saved ? 'Changes Saved!' : 'Save Changes'}
                </button>
            </div>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <div className="flex">
                        <div className="py-1"><ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-4"/></div>
                        <div>
                            <p className="font-bold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {config.map(category => (
                <div key={category.id} className="bg-white rounded-lg shadow-md">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        {editingCategoryId === category.id ? (
                            <input
                                autoFocus
                                value={category.name}
                                onChange={(e) => {
                                    const newName = e.target.value;
                                    setConfig(config.map(c => c.id === category.id ? { ...c, name: newName } : c));
                                }}
                                onBlur={() => setEditingCategoryId(null)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setEditingCategoryId(null); }}
                                className="font-bold text-gray-700 bg-white border rounded px-2 text-lg"
                            />
                        ) : (
                            <h4 className="font-bold text-gray-700 cursor-pointer text-lg" onClick={() => setEditingCategoryId(category.id)}>
                                {category.name || <span className="italic text-gray-400">Untitled Category</span>}
                            </h4>
                        )}
                        <button onClick={() => deleteCategory(category.id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="divide-y">
                        {category.items.map(item => (
                            <ItemRow key={item.id} item={item} onUpdate={(updated) => updateItem(category.id, item.id, updated)} onDelete={() => deleteItem(category.id, item.id)}/>
                        ))}
                    </div>
                    {addingItemToCategory === category.id ? (
                        <NewItemForm
                            onSave={(itemData) => handleAddItem(category.id, itemData)}
                            onCancel={() => setAddingItemToCategory(null)}
                        />
                    ) : (
                         <div className="p-4">
                            <button onClick={() => setAddingItemToCategory(category.id)} className="flex items-center text-sm text-orange-600 font-medium hover:text-orange-800">
                                <PlusCircleIcon className="w-5 h-5 mr-1"/> Add Item to this Category
                            </button>
                        </div>
                    )}
                </div>
            ))}
            
            <div className="mt-6 flex items-center justify-center space-x-6 p-4 bg-white rounded-lg shadow-md">
                <button onClick={handleAddItemToLastCategory} className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-bold">
                    Add New Item
                </button>
                <button onClick={handleAddCategory} className="text-sm text-gray-600 font-medium hover:text-gray-800">
                    + Add New Category
                </button>
            </div>
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

    const IconComponent = iconMap[editData.icon];
    const isUrl = !IconComponent && (editData.icon.startsWith('http') || editData.icon.startsWith('data:'));

    if (!isEditing) {
        return (
             <div className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                <div className="flex items-center space-x-3">
                    {isUrl ? (
                        <img src={item.icon} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                    ) : IconComponent ? (
                        <IconComponent className="w-5 h-5 text-gray-500 flex-shrink-0"/>
                    ) : (
                        <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500 font-mono truncate max-w-xs">{item.link}</p>
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
                 <div className="md:col-span-2">
                    <IconPicker icon={editData.icon} setIcon={val => setEditData(p => ({...p, icon: val}))} />
                 </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => { setIsEditing(false); setEditData(item); }} className="p-2 text-gray-500 hover:text-gray-800"><XIcon className="w-5 h-5"/></button>
                <button onClick={() => { onUpdate(editData); setIsEditing(false); }} className="p-2 text-green-500 hover:text-green-700"><CheckIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};




export default DrawerConfigPage;