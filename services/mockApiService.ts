import { MenuCategory, MenuItem, Allergen, Currency, SpecialType, ImageOrientation } from '../types';

// Keep initial data separate to initialize our "database"
const initialCategoriesData: MenuCategory[] = [
    {
        id: 'cat-1',
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        sortOrder: 1,
        activeFlag: true,
        tenantId: 'tenant-123'
    },
    {
        id: 'cat-2',
        name: 'Main Course',
        description: 'Our signature main dishes',
        sortOrder: 2,
        activeFlag: true,
        tenantId: 'tenant-123'
    },
    {
        id: 'cat-3',
        name: 'Desserts',
        description: 'Sweet endings to your meal',
        sortOrder: 3,
        activeFlag: true,
        tenantId: 'tenant-123'
    },
    {
        id: 'cat-4',
        name: 'Beverages',
        description: 'Refreshing drinks and cocktails',
        sortOrder: 4,
        activeFlag: true,
        tenantId: 'tenant-123'
    }
];

const initialMenuItemsData: MenuItem[] = [
    {
        id: 'item-1',
        name: 'Bruschetta',
        description: 'Toasted bread topped with tomatoes, garlic, and fresh basil',
        price: 8.99,
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=400',
        allergens: ['Gluten'],
        categoryId: 'cat-1',
        availabilityFlag: true,
        tenantId: 'tenant-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        soldOut: false,
        bogo: false,
        specialType: 'Vegetarian',
        calories: 120,
        prepTime: 10
    },
    {
        id: 'item-2',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: 16.99,
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
        allergens: ['Gluten', 'Dairy'],
        categoryId: 'cat-2',
        availabilityFlag: true,
        tenantId: 'tenant-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        soldOut: false,
        bogo: false,
        specialType: 'Vegetarian',
        calories: 280,
        prepTime: 20
    },
    {
        id: 'item-3',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
        price: 12.99,
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        categoryId: 'cat-1',
        availabilityFlag: true,
        tenantId: 'tenant-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        soldOut: false,
        bogo: false,
        specialType: 'Vegetarian',
        calories: 180,
        prepTime: 8
    },
    {
        id: 'item-4',
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
        price: 9.99,
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        categoryId: 'cat-3',
        availabilityFlag: true,
        tenantId: 'tenant-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        soldOut: false,
        bogo: false,
        specialType: 'None',
        calories: 320,
        prepTime: 15
    },
    {
        id: 'item-5',
        name: 'Iced Latte',
        description: 'Smooth espresso with cold milk and ice',
        price: 4.99,
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        allergens: ['Dairy'],
        categoryId: 'cat-4',
        availabilityFlag: true,
        tenantId: 'tenant-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        soldOut: false,
        bogo: false,
        specialType: 'None',
        calories: 80,
        prepTime: 5
    }
];

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