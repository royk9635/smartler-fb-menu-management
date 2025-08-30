import React, { useState, useMemo } from 'react';
import { MenuItem, SpecialType, Allergen, Currency } from '../types';
import { Search, Filter, Download, Upload, Trash2, Edit3 } from 'lucide-react';

interface SearchAndFilterProps {
    menuItems: MenuItem[];
    onFilteredItems: (items: MenuItem[]) => void;
    onBulkDelete: (itemIds: string[]) => void;
    onBulkEdit: (itemIds: string[]) => void;
    onExport: () => void;
    onImport: (file: File) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
    menuItems,
    onFilteredItems,
    onBulkDelete,
    onBulkEdit,
    onExport,
    onImport
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [specialType, setSpecialType] = useState<SpecialType | 'all'>('all');
    const [allergens, setAllergens] = useState<Allergen[]>([]);
    const [availability, setAvailability] = useState<'all' | 'available' | 'soldout'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'calories' | 'prepTime'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);

    // Get unique categories from menu items
    const categories = useMemo(() => {
        const uniqueCategories = new Set(menuItems.map(item => item.categoryId));
        return Array.from(uniqueCategories);
    }, [menuItems]);

    // Filter and sort items
    const filteredItems = useMemo(() => {
        let filtered = menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
            const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
            const matchesSpecialType = specialType === 'all' || item.specialType === specialType;
            const matchesAllergens = allergens.length === 0 || 
                                   allergens.some(allergen => item.allergens.includes(allergen));
            const matchesAvailability = availability === 'all' || 
                                     (availability === 'available' && !item.soldOut) ||
                                     (availability === 'soldout' && item.soldOut);

            return matchesSearch && matchesCategory && matchesPrice && 
                   matchesSpecialType && matchesAllergens && matchesAvailability;
        });

        // Sort items
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'calories':
                    aValue = a.calories || 0;
                    bValue = b.calories || 0;
                    break;
                case 'prepTime':
                    aValue = a.prepTime || 0;
                    bValue = b.prepTime || 0;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        onFilteredItems(filtered);
        return filtered;
    }, [menuItems, searchTerm, selectedCategory, priceRange, specialType, allergens, availability, sortBy, sortOrder, onFilteredItems]);

    const handleSelectAll = () => {
        if (selectedItems.size === filteredItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map(item => item.id)));
        }
    };

    const handleItemSelect = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const handleBulkDelete = () => {
        if (selectedItems.size > 0) {
            onBulkDelete(Array.from(selectedItems));
            setSelectedItems(new Set());
        }
    };

    const handleBulkEdit = () => {
        if (selectedItems.size > 0) {
            onBulkEdit(Array.from(selectedItems));
        }
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Search Bar */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search menu items by name, description, or item code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                        showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700'
                    }`}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                </button>

                <button
                    onClick={onExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>

                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import
                    <input
                        type="file"
                        accept=".csv,.xlsx,.json"
                        onChange={handleFileImport}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(categoryId => (
                                <option key={categoryId} value={categoryId}>{categoryId}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Special Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Special Type</label>
                        <select
                            value={specialType}
                            onChange={(e) => setSpecialType(e.target.value as SpecialType | 'all')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            {Object.values(SpecialType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Availability Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                        <select
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value as 'all' | 'available' | 'soldout')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Items</option>
                            <option value="available">Available</option>
                            <option value="soldout">Sold Out</option>
                        </select>
                    </div>

                    {/* Allergen Filter */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(Allergen).map(allergen => (
                                <label key={allergen} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={allergens.includes(allergen)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setAllergens([...allergens, allergen]);
                                            } else {
                                                setAllergens(allergens.filter(a => a !== allergen));
                                            }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{allergen}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'calories' | 'prepTime')}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name">Name</option>
                                <option value="price">Price</option>
                                <option value="calories">Calories</option>
                                <option value="prepTime">Prep Time</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                    Showing {filteredItems.length} of {menuItems.length} items
                </div>
                
                {selectedItems.size > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            {selectedItems.size} item(s) selected
                        </span>
                        <button
                            onClick={handleSelectAll}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button
                            onClick={handleBulkEdit}
                            disabled={selectedItems.size === 0}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Edit3 className="w-4 h-4" />
                            Bulk Edit
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={selectedItems.size === 0}
                            className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Bulk Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchAndFilter;
