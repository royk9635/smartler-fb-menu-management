
export interface MenuCategory {
    id: string;
    name: string;
    description: string;
    sortOrder: number;
    activeFlag: boolean;
    tenantId: string;
}

export enum SpecialType {
    NONE = 'None',
    VEG = 'Vegetarian',
    NON_VEG = 'Non-Vegetarian',
    VEGAN = 'Vegan',
    CHEF_SPECIAL = "Chef's Special",
}

export enum ImageOrientation {
    LANDSCAPE = '16:9',
    PORTRAIT = '3:4',
    SQUARE = '1:1',
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: Currency;
    imageUrl: string;
    videoUrl?: string;
    allergens: Allergen[];
    categoryId: string;
    availabilityFlag: boolean;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
    
    // New fields based on reference
    displayName?: string;
    itemCode?: string;
    prepTime?: number; // in minutes
    soldOut: boolean;
    portion?: string;
    specialType?: SpecialType;
    calories?: number;
    maxOrderQty?: number;
    bogo: boolean;
    complimentary?: string;
    imageOrientation?: ImageOrientation;
    availableTime?: string;
    availableDate?: string;
}

export enum Currency {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
}

export enum Allergen {
    GLUTEN = 'Gluten',
    DAIRY = 'Dairy',
    NUTS = 'Nuts',
    SOY = 'Soy',
    FISH = 'Fish',
    SHELLFISH = 'Shellfish',
    EGGS = 'Eggs',
}
