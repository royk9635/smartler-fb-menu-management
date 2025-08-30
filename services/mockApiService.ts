import { MenuCategory, MenuItem, Allergen, Currency, SpecialType, ImageOrientation } from '../types';

// Keep initial data separate to initialize our "database"
const initialCategoriesData: MenuCategory[] = [];

const initialMenuItemsData: MenuItem[] = [];

// --- In-memory "database" ---
const categoryDB = new Map<string, MenuCategory>(initialCategoriesData.map(c => [c.id, c]));
const menuItemDB = new Map<string, MenuItem>(initialMenuItemsData.map(i => [i.id, i]));

// Helper to simulate network delay
const simulateDelay = (delay = 500): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Helper to return deep copies to prevent state mutation issues
const resolveWithCopy = async <T>(data: T): Promise<T> => {
    await simulateDelay();
    return structuredClone(data);
};

// --- Category API ---

export const getCategories = (tenantId: string): Promise<MenuCategory[]> => {
    const data = Array.from(categoryDB.values())
        .filter(c => c.tenantId === tenantId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    return resolveWithCopy(data);
};

export const addCategory = async (categoryData: Omit<MenuCategory, 'id'>): Promise<MenuCategory> => {
    const newCategory: MenuCategory = {
        ...categoryData,
        id: `cat-${Date.now()}`,
    };
    categoryDB.set(newCategory.id, newCategory);
    return resolveWithCopy(newCategory);
};

export const updateCategory = async (updatedCategory: MenuCategory): Promise<MenuCategory> => {
    if (!categoryDB.has(updatedCategory.id)) {
        throw new Error("Category not found");
    }
    categoryDB.set(updatedCategory.id, updatedCategory);
    return resolveWithCopy(updatedCategory);
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
    if (!categoryDB.has(categoryId)) {
        throw new Error("Category not found");
    }
    
    // Delete the category itself
    categoryDB.delete(categoryId);
    
    // Safely find and delete all associated menu items
    const itemsToDelete: string[] = [];
    for (const [itemId, item] of menuItemDB.entries()) {
        if (item.categoryId === categoryId) {
            itemsToDelete.push(itemId);
        }
    }
    itemsToDelete.forEach(id => menuItemDB.delete(id));
    
    await simulateDelay();
};

// --- Menu Item API ---

export const getMenuItems = (tenantId: string, categoryId: string): Promise<MenuItem[]> => {
    const data = Array.from(menuItemDB.values())
        .filter(item => item.tenantId === tenantId && item.categoryId === categoryId);
    return resolveWithCopy(data);
};

export const getAllMenuItems = (tenantId: string): Promise<MenuItem[]> => {
    const data = Array.from(menuItemDB.values()).filter(item => item.tenantId === tenantId);
    return resolveWithCopy(data);
};

export const addMenuItem = async (itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> => {
    const newItem: MenuItem = {
        ...itemData,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    menuItemDB.set(newItem.id, newItem);
    return resolveWithCopy(newItem);
};

export const addMenuItemsBatch = async (itemsData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> => {
    const startId = Date.now();
    itemsData.forEach((item, index) => {
        const newItem: MenuItem = {
            ...item,
            id: `item-${startId + index}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        menuItemDB.set(newItem.id, newItem);
    });
    await simulateDelay();
    return itemsData.length;
};

export const updateMenuItem = async (updatedItem: MenuItem): Promise<MenuItem> => {
    if (!menuItemDB.has(updatedItem.id)) {
        throw new Error("Menu item not found");
    }
    const itemToUpdate = { ...updatedItem, updatedAt: new Date().toISOString() };
    menuItemDB.set(updatedItem.id, itemToUpdate);
    return resolveWithCopy(itemToUpdate);
};

export const deleteMenuItem = async (itemId: string): Promise<void> => {
    const deleted = menuItemDB.delete(itemId);
    if (!deleted) {
        throw new Error("Menu item not found");
    }
    await simulateDelay();
};