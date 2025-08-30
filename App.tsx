import React, { useState, useEffect, useCallback } from 'react';
import { MenuCategory, MenuItem, Allergen, Currency, SpecialType, ImageOrientation } from './types';
import * as api from './services/mockApiService';
import { exportImportService, ExportOptions } from './services/exportImportService';
import CategoryList from './components/CategoryList';
import MenuItemList from './components/MenuItemList';
import CategoryModal from './components/CategoryModal';
import MenuItemModal from './components/MenuItemModal';
import ConfirmationModal from './components/ConfirmationModal';
import Toast from './components/Toast';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import ImagePreviewModal from './components/ImagePreviewModal';
import QRCodeModal from './components/QRCodeModal';
import SearchAndFilter from './components/SearchAndFilter';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import BulkOperationsModal from './components/BulkOperationsModal';
import ThemeToggle from './components/ThemeToggle';
import AIMenuOptimizationDashboard from './components/AIMenuOptimizationDashboard';
import VoiceMenuUpdates from './components/VoiceMenuUpdates';
import ARMenuPreview from './components/ARMenuPreview';

declare var XLSX: any;

const App: React.FC = () => {
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    
    const [isCategoryModalOpen, setCategoryModalOpen] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
    
    const [isMenuItemModalOpen, setMenuItemModalOpen] = useState<boolean>(false);
    const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>('');

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    const [isImageModalOpen, setImageModalOpen] = useState<boolean>(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    const [isQRCodeModalOpen, setQRCodeModalOpen] = useState<boolean>(false);
    const [qrCodeData, setQrCodeData] = useState<{ url: string; title: string } | null>(null);

    // New state for enhanced features
    const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
    const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState<boolean>(false);
    const [selectedItemsForBulk, setSelectedItemsForBulk] = useState<MenuItem[]>([]);
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        format: 'csv',
        includeImages: false,
        includeMetadata: true
    });

    // New state for AI-powered features
    const [showAIOptimization, setShowAIOptimization] = useState<boolean>(false);
    const [showVoiceUpdates, setShowVoiceUpdates] = useState<boolean>(false);
    const [showARPreview, setShowARPreview] = useState<boolean>(false);
    const [selectedItemForAR, setSelectedItemForAR] = useState<MenuItem | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000); // Increased timeout for potentially longer messages
    };

    // FIX: Moved handleBackToCategories before fetchCategories and wrapped in useCallback
    const handleBackToCategories = useCallback(() => {
        setSelectedCategory(null);
        setMenuItems([]);
    }, []);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedCategories = await api.getCategories('tenant-123');
            setCategories(fetchedCategories);
            // If the selected category no longer exists after a refresh, go back to the list
            if (selectedCategory && !fetchedCategories.find(c => c.id === selectedCategory.id)) {
                handleBackToCategories();
            }
        } catch (error) {
            showToast('Failed to fetch categories.', 'error');
        } finally {
            setLoading(false);
        }
    // FIX: Added handleBackToCategories to the dependency array
    }, [selectedCategory, handleBackToCategories]);

    const fetchMenuItems = useCallback(async () => {
        if (!selectedCategory) return;
        try {
            console.log('Fetching menu items for category:', selectedCategory.id);
            const items = await api.getMenuItems('tenant-123', selectedCategory.id);
            console.log('Fetched menu items:', items);
            setMenuItems(items);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            showToast('Failed to fetch menu items.', 'error');
        }
    }, [selectedCategory]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (selectedCategory) {
            console.log('Selected category changed, fetching menu items...');
            fetchMenuItems();
        }
    }, [selectedCategory]);

    const handleSelectCategory = async (category: MenuCategory) => {
        console.log('Selecting category:', category);
        setSelectedCategory(category);
        setLoading(true);
        try {
            console.log('Fetching menu items for category:', category.id);
            const items = await api.getMenuItems('tenant-123', category.id);
            console.log('Fetched items:', items);
            setMenuItems(items);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            showToast(`Failed to fetch menu items for ${category.name}.`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async (categoryData: Omit<MenuCategory, 'id' | 'tenantId'>) => {
        try {
            if (editingCategory) {
                await api.updateCategory({ ...categoryData, id: editingCategory.id, tenantId: 'tenant-123' });
                showToast('Category updated successfully!', 'success');
            } else {
                await api.addCategory({ ...categoryData, tenantId: 'tenant-123' });
                showToast('Category added successfully!', 'success');
            }
            await fetchCategories(); // Re-fetch to get the latest list including the new/updated one
            setCategoryModalOpen(false);
            setEditingCategory(null);
        } catch (error) {
            showToast('Failed to save category.', 'error');
        }
    };

    const handleDeleteCategory = (categoryId: string) => {
        const categoryToDelete = categories.find(c => c.id === categoryId);
        if (!categoryToDelete) return;

        setConfirmMessage(`Are you sure you want to delete the category "${categoryToDelete.name}"? All items within it will also be deleted.`);
        
        setDeleteAction(() => () => {
            const originalCategories = [...categories];
            setCategories(prevCategories => prevCategories.filter(c => c.id !== categoryId));
            if (selectedCategory?.id === categoryId) {
                handleBackToCategories();
            }
            api.deleteCategory(categoryId)
                .then(() => {
                    showToast('Category deleted successfully!', 'success');
                })
                .catch((error) => {
                    showToast('Failed to delete category. Restoring...', 'error');
                    console.error(error);
                    setCategories(originalCategories);
                });
        });

        setConfirmModalOpen(true);
    };
    
    const handleSaveMenuItem = async (itemData: Omit<MenuItem, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
        if (!selectedCategory) return;
        try {
            if (editingMenuItem) {
                await api.updateMenuItem({ ...itemData, id: editingMenuItem.id, tenantId: 'tenant-123', createdAt: editingMenuItem.createdAt, updatedAt: new Date().toISOString() });
                showToast('Menu item updated successfully!', 'success');
            } else {
                await api.addMenuItem({ ...itemData, tenantId: 'tenant-123' });
                showToast('Menu item added successfully!', 'success');
            }
            // Re-fetch items for the current category to reflect changes
            const items = await api.getMenuItems('tenant-123', selectedCategory.id);
            setMenuItems(items);
            setMenuItemModalOpen(false);
            setEditingMenuItem(null);
        } catch (error) {
            showToast('Failed to save menu item.', 'error');
        }
    };

    const handleDeleteMenuItem = (itemId: string) => {
        if (!selectedCategory) return;
        const itemToDelete = menuItems.find(item => item.id === itemId);
        if (!itemToDelete) return;

        setConfirmMessage(`Are you sure you want to delete the menu item "${itemToDelete.name}"?`);

        setDeleteAction(() => () => {
            const originalItems = [...menuItems];
            setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
            api.deleteMenuItem(itemId)
                .then(() => {
                    showToast('Menu item deleted successfully!', 'success');
                })
                .catch((error) => {
                    showToast('Failed to delete menu item. Restoring...', 'error');
                    console.error(error);
                    setMenuItems(originalItems);
                });
        });

        setConfirmModalOpen(true);
    };

    const handleToggleMenuItemAvailability = async (itemToToggle: MenuItem) => {
        const updatedItem = { ...itemToToggle, availabilityFlag: !itemToToggle.availabilityFlag };
    
        // Optimistic UI update
        const originalItems = [...menuItems];
        setMenuItems(prevItems =>
            prevItems.map(item =>
                item.id === itemToToggle.id ? updatedItem : item
            )
        );
    
        try {
            await api.updateMenuItem(updatedItem);
            showToast(
                `'${updatedItem.name}' is now ${updatedItem.availabilityFlag ? 'available' : 'unavailable'}.`,
                'success'
            );
        } catch (error) {
            showToast(`Failed to update '${itemToToggle.name}'. Reverting...`, 'error');
            console.error(error);
            setMenuItems(originalItems); // Revert on failure
        }
    };

    const handleAddItemToCategory = (category: MenuCategory) => {
        setSelectedCategory(category);
        setEditingMenuItem(null);
        setMenuItemModalOpen(true);
    };

    const handleExcelUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target!.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);

                    const newItems: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [];
                    let successCount = 0;
                    let errorCount = 0;
                    const errors: string[] = [];
                    
                    const categoryNameToIdMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
                    let newCategoriesCreated = 0;
                    const initialCategoryCount = categories.length;

                    for (const row of json as any[]) {
                        const categoryName = row['Category Name'] || row['category_name'];
                        if (!categoryName) {
                            errorCount++;
                            errors.push(`Row with item "${row['Name'] || 'N/A'}" skipped: Missing Category Name.`);
                            continue;
                        }

                        let categoryId = categoryNameToIdMap.get(String(categoryName).toLowerCase());

                        if (!categoryId) {
                            try {
                                const newCategory = await api.addCategory({
                                    name: String(categoryName),
                                    description: 'Automatically created from Excel import',
                                    sortOrder: initialCategoryCount + newCategoriesCreated,
                                    activeFlag: true,
                                    tenantId: 'tenant-123',
                                });
                                categoryId = newCategory.id;
                                categoryNameToIdMap.set(newCategory.name.toLowerCase(), newCategory.id);
                                newCategoriesCreated++;
                            } catch (catError) {
                                errorCount++;
                                errors.push(`Row with item "${row['Name'] || 'N/A'}" skipped: Failed to auto-create category "${categoryName}".`);
                                console.error(catError);
                                continue;
                            }
                        }

                        const price = parseFloat(row['Price']);
                        if (isNaN(price) || price <= 0) {
                            errorCount++;
                            errors.push(`Row with item "${row['Name'] || 'N/A'}" skipped: Invalid or missing Price.`);
                            continue;
                        }

                        const newItem: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'> = {
                            name: String(row['Name'] || ''),
                            description: String(row['Description'] || ''),
                            price: price,
                            currency: (Object.values(Currency).includes(row['Currency'] as Currency) ? row['Currency'] : Currency.USD) as Currency,
                            imageUrl: String(row['Image URL'] || 'https://picsum.photos/400/300'),
                            videoUrl: String(row['Video URL'] || ''),
                            allergens: [], // Note: Complex to parse from Excel, defaulting to empty.
                            categoryId: categoryId,
                            availabilityFlag: String(row['Available']).toLowerCase() === 'true',
                            displayName: String(row['Display Name'] || ''),
                            itemCode: String(row['Item Code'] || ''),
                            prepTime: parseInt(String(row['Prep Time (min)']), 10) || 0,
                            soldOut: String(row['Sold Out']).toLowerCase() === 'true',
                            portion: String(row['Portion'] || ''),
                            specialType: (Object.values(SpecialType).includes(row['Special Type'] as SpecialType) ? row['Special Type'] : SpecialType.NONE) as SpecialType,
                            calories: parseInt(String(row['Calories']), 10) || 0,
                            maxOrderQty: parseInt(String(row['Max Order Qty']), 10) || 10,
                            bogo: String(row['BOGO']).toLowerCase() === 'true',
                            complimentary: String(row['Complimentary'] || ''),
                            imageOrientation: (Object.values(ImageOrientation).includes(row['Image Orientation'] as ImageOrientation) ? row['Image Orientation'] : ImageOrientation.SQUARE) as ImageOrientation,
                            availableTime: String(row['Available Time'] || ''),
                            availableDate: String(row['Available Date'] || ''),
                        };

                        if (!newItem.name) {
                            errorCount++;
                            errors.push(`A row was skipped: Missing Item Name.`);
                            continue;
                        }

                        newItems.push({ ...newItem, tenantId: 'tenant-123' });
                        successCount++;
                    }

                    if (newItems.length > 0) {
                        await api.addMenuItemsBatch(newItems);
                    }

                    let message = '';
                    if (successCount > 0) message += `${successCount} items added successfully. `;
                    if (errorCount > 0) message += `${errorCount} items failed.`;
                    showToast(message || 'No items found in file.', errorCount > 0 ? 'error' : 'success');
                    if (errorCount > 0) console.error("Excel upload errors:\n", errors.join('\n'));
                    
                    await fetchCategories(); // Refresh categories in case new items were added to them
                    if (selectedCategory) { // If viewing a category, refresh its items
                        await handleSelectCategory(selectedCategory);
                    }

                } catch (err) {
                    showToast('Failed to process the Excel file.', 'error');
                    console.error(err);
                } finally {
                     setIsUploading(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            showToast('Failed to read file.', 'error');
            console.error(error);
            setIsUploading(false);
        }
    };

    const handleExcelExport = async () => {
        setIsExporting(true);
        try {
            const allItems = await api.getAllMenuItems('tenant-123');
            if (allItems.length === 0) {
                showToast('No items to export.', 'error');
                return;
            }

            const categoryMap = new Map(categories.map(c => [c.id, c.name]));

            const dataToExport = allItems.map(item => ({
                'ID': item.id,
                'Name': item.name,
                'Display Name': item.displayName,
                'Description': item.description,
                'Item Code': item.itemCode,
                'Category Name': categoryMap.get(item.categoryId) || 'N/A',
                'Price': item.price,
                'Currency': item.currency,
                'Available': item.availabilityFlag,
                'Sold Out': item.soldOut,
                'Prep Time (min)': item.prepTime,
                'Portion': item.portion,
                'Calories': item.calories,
                'Special Type': item.specialType,
                'Max Order Qty': item.maxOrderQty,
                'BOGO': item.bogo,
                'Complimentary': item.complimentary,
                'Allergens': item.allergens.join(', '),
                'Image URL': item.imageUrl,
                'Video URL': item.videoUrl,
                'Image Orientation': item.imageOrientation,
                'Available Time': item.availableTime,
                'Available Date': item.availableDate,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Menu Items');
            
            const colWidths = Object.keys(dataToExport[0]).map(key => ({
                wch: Math.max(key.length, ...dataToExport.map(row => String((row as any)[key] || '').length)) + 2,
            }));
            worksheet['!cols'] = colWidths;

            XLSX.writeFile(workbook, 'Smartler_F&B_Menu_Export.xlsx');
            showToast('Exported successfully!', 'success');

        } catch (error) {
            showToast('Failed to export data.', 'error');
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleReorderCategories = async (reorderedCategories: MenuCategory[]) => {
        const originalCategories = [...categories];
        // Optimistic UI update
        setCategories(reorderedCategories);

        const updatesToSend = reorderedCategories.filter(newCat => {
            const oldCat = originalCategories.find(c => c.id === newCat.id);
            // Only create an update promise if the sortOrder has actually changed
            return oldCat && oldCat.sortOrder !== newCat.sortOrder;
        });

        if (updatesToSend.length === 0) {
            return; // No changes to save
        }
        
        const updatePromises = updatesToSend.map(category => api.updateCategory(category));
        
        try {
            await Promise.all(updatePromises);
            showToast('Category order saved!', 'success');
        } catch (error) {
            showToast('Failed to save new category order. Reverting...', 'error');
            setCategories(originalCategories); // Revert on failure
        }
    };
    
    const handleImageClick = (imageUrl: string) => {
        setPreviewImageUrl(imageUrl);
        setImageModalOpen(true);
    };

    const handleCloseImageModal = () => {
        setImageModalOpen(false);
        setPreviewImageUrl(null);
    };

    const handleGenerateQR = (category: MenuCategory | null) => {
        // Use a hypothetical public URL structure
        const baseUrl = window.location.origin.replace(/\/$/, '') + '/menu/tenant-123';
        if (category) {
            setQrCodeData({
                url: `${baseUrl}?categoryId=${category.id}`,
                title: `QR for "${category.name}"`,
            });
        } else {
            setQrCodeData({
                url: baseUrl,
                title: 'QR for Full Menu',
            });
        }
        setQRCodeModalOpen(true);
    };

    // New handler functions for enhanced features
    const handleFilteredItems = (items: MenuItem[]) => {
        setFilteredMenuItems(items);
    };

    const handleBulkDelete = async (itemIds: string[]) => {
        try {
            for (const id of itemIds) {
                await api.deleteMenuItem(id);
            }
            showToast(`Successfully deleted ${itemIds.length} item(s)`, 'success');
            await fetchMenuItems();
        } catch (error) {
            showToast('Failed to delete some items', 'error');
        }
    };

    const handleBulkEdit = (itemIds: string[]) => {
        const items = menuItems.filter(item => itemIds.includes(item.id));
        setSelectedItemsForBulk(items);
        setBulkModalOpen(true);
    };

    const handleBulkSave = async (updatedItems: MenuItem[]) => {
        try {
            for (const item of updatedItems) {
                await api.updateMenuItem(item);
            }
            showToast(`Successfully updated ${updatedItems.length} item(s)`, 'success');
            await fetchMenuItems();
            setBulkModalOpen(false);
            setSelectedItemsForBulk([]);
        } catch (error) {
            showToast('Failed to update some items', 'error');
        }
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);
            await exportImportService.exportData(
                filteredMenuItems.length > 0 ? filteredMenuItems : menuItems,
                categories,
                exportOptions
            );
            showToast('Export completed successfully!', 'success');
        } catch (error) {
            showToast('Export failed', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (file: File) => {
        try {
            setIsUploading(true);
            const result = await exportImportService.importData(file);
            
            if (result.success) {
                if (result.importedItems && result.importedItems.length > 0) {
                    // Add imported items to the system
                    for (const item of result.importedItems) {
                        await api.addMenuItem(item);
                    }
                    showToast(`Successfully imported ${result.importedItems.length} items`, 'success');
                    await fetchMenuItems();
                }
                if (result.importedCategories && result.importedCategories.length > 0) {
                    // Add imported categories to the system
                    for (const category of result.importedCategories) {
                        await api.addCategory(category);
                    }
                    showToast(`Successfully imported ${result.importedCategories.length} categories`, 'success');
                    await fetchCategories();
                }
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Import failed', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // New handler functions for AI-powered features
    const handleVoiceUpdate = (result: any) => {
        if (result.success) {
            showToast(result.message, 'success');
            // Refresh data if needed
            if (result.action === 'created' || result.action === 'updated' || result.action === 'deleted') {
                fetchCategories();
                if (selectedCategory) {
                    fetchMenuItems();
                }
            }
        } else {
            showToast(result.message, 'error');
        }
    };

    const handleARPreview = (item: MenuItem) => {
        console.log('AR Preview requested for item:', item);
        setSelectedItemForAR(item);
        setShowARPreview(true);
    };

    const closeARPreview = () => {
        setShowARPreview(false);
        setSelectedItemForAR(null);
    };

    return (
        <div className="min-h-screen text-slate-800">
             {(isUploading || isExporting) && (
                <div className="fixed inset-0 bg-white bg-opacity-75 z-[100] flex flex-col justify-center items-center backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center border">
                        <LoadingSpinner />
                        <p className="mt-4 text-lg text-slate-700 font-semibold">
                            {isUploading ? 'Processing Excel file...' : 'Exporting data...'}
                        </p>
                        <p className="text-sm text-slate-500">Please wait.</p>
                    </div>
                </div>
            )}
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : selectedCategory ? (
                    <>
                        <SearchAndFilter
                            menuItems={menuItems}
                            onFilteredItems={handleFilteredItems}
                            onBulkDelete={handleBulkDelete}
                            onBulkEdit={handleBulkEdit}
                            onExport={handleExport}
                            onImport={handleImport}
                        />
                        <MenuItemList
                            category={selectedCategory}
                            items={filteredMenuItems.length > 0 ? filteredMenuItems : menuItems}
                            onAddItem={() => { setEditingMenuItem(null); setMenuItemModalOpen(true); }}
                            onEditItem={(item) => { setEditingMenuItem(item); setMenuItemModalOpen(true); }}
                            onDeleteItem={handleDeleteMenuItem}
                            onBack={handleBackToCategories}
                            onToggleAvailability={handleToggleMenuItemAvailability}
                            onImageClick={handleImageClick}
                            onARPreview={handleARPreview}
                        />
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Smart F&B Menu Management</h1>
                                <p className="text-gray-600">Manage your menu categories and items efficiently</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <ThemeToggle />
                                <button
                                    onClick={() => setShowAnalytics(!showAnalytics)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        showAnalytics 
                                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                                </button>
                                <button
                                    onClick={() => setShowAIOptimization(!showAIOptimization)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        showAIOptimization 
                                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {showAIOptimization ? 'Hide AI Optimization' : '🤖 AI Optimization'}
                                </button>
                                <button
                                    onClick={() => setShowVoiceUpdates(!showVoiceUpdates)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        showVoiceUpdates 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {showVoiceUpdates ? 'Hide Voice Updates' : '🎤 Voice Updates'}
                                </button>
                            </div>
                        </div>

                        {showAnalytics && (
                            <div className="mb-8">
                                <AnalyticsDashboard 
                                    menuItems={menuItems}
                                    categories={categories}
                                />
                            </div>
                        )}

                        {showAIOptimization && (
                            <div className="mb-8">
                                <AIMenuOptimizationDashboard 
                                    menuItems={menuItems}
                                    categories={categories}
                                />
                            </div>
                        )}

                        {showVoiceUpdates && (
                            <div className="mb-8">
                                <VoiceMenuUpdates onVoiceUpdate={handleVoiceUpdate} />
                            </div>
                        )}

                        <CategoryList
                            categories={categories}
                            onAddCategory={() => { setEditingCategory(null); setCategoryModalOpen(true); }}
                            onEditCategory={(cat) => { setEditingCategory(cat); setCategoryModalOpen(true); }}
                            onDeleteCategory={handleDeleteCategory}
                            onSelectCategory={handleSelectCategory}
                            onAddItemToCategory={handleAddItemToCategory}
                            onUploadExcel={handleExcelUpload}
                            onExportExcel={handleExcelExport}
                            isExporting={isExporting}
                            onReorderCategories={handleReorderCategories}
                            onGenerateQR={handleGenerateQR}
                        />
                    </>
                )}
            </main>
            {isCategoryModalOpen && (
                <CategoryModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => { setCategoryModalOpen(false); setEditingCategory(null); }}
                    onSubmit={handleSaveCategory}
                    initialData={editingCategory}
                />
            )}
            {isMenuItemModalOpen && selectedCategory && (
                <MenuItemModal
                    isOpen={isMenuItemModalOpen}
                    onClose={() => { setMenuItemModalOpen(false); setEditingMenuItem(null); }}
                    onSubmit={handleSaveMenuItem}
                    initialData={editingMenuItem}
                    categoryId={selectedCategory.id}
                    availableAllergens={Object.values(Allergen)}
                    availableCurrencies={Object.values(Currency)}
                />
            )}
            {isConfirmModalOpen && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={() => {
                        if (deleteAction) {
                            deleteAction();
                        }
                        setConfirmModalOpen(false);
                    }}
                    title="Confirm Deletion"
                    message={confirmMessage}
                />
            )}
             {isImageModalOpen && (
                <ImagePreviewModal
                    isOpen={isImageModalOpen}
                    onClose={handleCloseImageModal}
                    imageUrl={previewImageUrl}
                />
            )}
             {isQRCodeModalOpen && qrCodeData && (
                <QRCodeModal
                    isOpen={isQRCodeModalOpen}
                    onClose={() => { setQRCodeModalOpen(false); setQrCodeData(null); }}
                    title={qrCodeData.title}
                    url={qrCodeData.url}
                />
            )}
            {isBulkModalOpen && (
                <BulkOperationsModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setBulkModalOpen(false)}
                    selectedItems={selectedItemsForBulk}
                    onSave={handleBulkSave}
                />
            )}
            {showARPreview && selectedItemForAR && (
                <ARMenuPreview
                    menuItem={selectedItemForAR}
                    onClose={closeARPreview}
                />
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default App;