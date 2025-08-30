import React, { useState, useMemo } from 'react';
import { MenuCategory, MenuItem } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, SearchIcon } from './Icons';
import ToggleSwitch from './ToggleSwitch';

interface MenuItemListProps {
    category: MenuCategory;
    items: MenuItem[];
    onAddItem: () => void;
    onEditItem: (item: MenuItem) => void;
    onDeleteItem: (itemId: string) => void;
    onBack: () => void;
    onToggleAvailability: (item: MenuItem) => void;
    onImageClick: (imageUrl: string) => void;
}

const MenuItemList: React.FC<MenuItemListProps> = ({ category, items, onAddItem, onEditItem, onDeleteItem, onBack, onToggleAvailability, onImageClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [itemCodeFilter, setItemCodeFilter] = useState('');

    const filteredItems = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const lowercasedItemCodeFilter = itemCodeFilter.toLowerCase();

        if (!lowercasedSearchTerm && !lowercasedItemCodeFilter) {
            return items;
        }
        
        return items.filter(item => {
            const nameMatch = lowercasedSearchTerm
                ? item.name.toLowerCase().includes(lowercasedSearchTerm) ||
                  item.description.toLowerCase().includes(lowercasedSearchTerm)
                : true;
            
            const codeMatch = lowercasedItemCodeFilter
                ? item.itemCode?.toLowerCase().includes(lowercasedItemCodeFilter)
                : true;

            return nameMatch && codeMatch;
        });
    }, [items, searchTerm, itemCodeFilter]);

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                     <button
                        onClick={onBack}
                        className="flex items-center text-slate-500 hover:text-slate-800 font-semibold p-2 rounded-full hover:bg-slate-100 transition duration-300"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-700">
                        Items in <span className="text-primary-600">{category.name}</span>
                    </h2>
                </div>
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by item code..."
                            value={itemCodeFilter}
                            onChange={(e) => setItemCodeFilter(e.target.value)}
                            className="w-full sm:w-56 pl-10 pr-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <button
                        onClick={onAddItem}
                        className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Item
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600 w-16">Image</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Price</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Availability</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {filteredItems.map(item => (
                            <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-2 px-4">
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.name} 
                                        className="h-12 w-12 object-cover rounded-md cursor-pointer hover:scale-110 transition-transform duration-200"
                                        onClick={() => onImageClick(item.imageUrl)}
                                    />
                                </td>
                                <td className="py-3 px-4">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-slate-500 truncate" style={{maxWidth: '300px'}}>{item.description}</div>
                                </td>
                                <td className="py-3 px-4">{item.price.toFixed(2)} {item.currency}</td>
                                <td className="py-3 px-4 text-center">
                                    <ToggleSwitch
                                        checked={item.availabilityFlag}
                                        onChange={() => onToggleAvailability(item)}
                                    />
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onEditItem(item)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Item">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onDeleteItem(item.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Item">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {items.length > 0 && filteredItems.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>No items match your search.</p>
                </div>
            )}
            {items.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>No items found in this category. Click "Add Item" to create one.</p>
                </div>
            )}
        </div>
    );
};

export default MenuItemList;