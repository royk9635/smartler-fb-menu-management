import { MenuItem, MenuCategory } from '../types';

export interface ExportOptions {
    format: 'csv' | 'json' | 'xlsx';
    includeImages?: boolean;
    includeMetadata?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
}

export interface ImportResult {
    success: boolean;
    message: string;
    importedItems?: MenuItem[];
    importedCategories?: MenuCategory[];
    errors?: string[];
}

class ExportImportService {
    /**
     * Export menu data to various formats
     */
    async exportData(
        menuItems: MenuItem[],
        categories: MenuCategory[],
        options: ExportOptions
    ): Promise<void> {
        try {
            switch (options.format) {
                case 'csv':
                    await this.exportToCSV(menuItems, categories, options);
                    break;
                case 'json':
                    await this.exportToJSON(menuItems, categories, options);
                    break;
                case 'xlsx':
                    await this.exportToXLSX(menuItems, categories, options);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${options.format}`);
            }
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }

    /**
     * Import menu data from various formats
     */
    async importData(file: File): Promise<ImportResult> {
        try {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            
            switch (fileExtension) {
                case 'csv':
                    return await this.importFromCSV(file);
                case 'json':
                    return await this.importFromJSON(file);
                case 'xlsx':
                    return await this.importFromXLSX(file);
                default:
                    return {
                        success: false,
                        message: `Unsupported file format: ${fileExtension}. Please use CSV, JSON, or XLSX files.`
                    };
            }
        } catch (error) {
            console.error('Import failed:', error);
            return {
                success: false,
                message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Export to CSV format
     */
    private async exportToCSV(
        menuItems: MenuItem[],
        categories: MenuCategory[],
        options: ExportOptions
    ): Promise<void> {
        // Create CSV headers
        const headers = [
            'ID', 'Name', 'Description', 'Price', 'Currency', 'Category ID', 'Category Name',
            'Special Type', 'Allergens', 'Availability Flag', 'Sold Out', 'Prep Time (min)',
            'Calories', 'Max Order Qty', 'BOGO', 'Complimentary', 'Image Orientation',
            'Created At', 'Updated At'
        ];

        // Create CSV rows
        const rows = menuItems.map(item => {
            const category = categories.find(cat => cat.id === item.categoryId);
            return [
                item.id,
                `"${item.name}"`,
                `"${item.description}"`,
                item.price,
                item.currency,
                item.categoryId,
                `"${category?.name || ''}"`,
                item.specialType || '',
                item.allergens.join(';'),
                item.availabilityFlag,
                item.soldOut,
                item.prepTime || '',
                item.calories || '',
                item.maxOrderQty || '',
                item.bogo,
                `"${item.complimentary || ''}"`,
                item.imageOrientation || '',
                item.createdAt,
                item.updatedAt
            ];
        });

        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `menu-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Export to JSON format
     */
    private async exportToJSON(
        menuItems: MenuItem[],
        categories: MenuCategory[],
        options: ExportOptions
    ): Promise<void> {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            metadata: options.includeMetadata ? {
                totalItems: menuItems.length,
                totalCategories: categories.length,
                exportOptions: options
            } : undefined,
            categories: categories,
            menuItems: menuItems
        };

        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `menu-export-${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Export to XLSX format
     */
    private async exportToXLSX(
        menuItems: MenuItem[],
        categories: MenuCategory[],
        options: ExportOptions
    ): Promise<void> {
        // Check if XLSX library is available
        if (typeof XLSX === 'undefined') {
            throw new Error('XLSX library not available. Please install xlsx package for Excel export.');
        }

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Create categories worksheet
        const categoriesData = categories.map(cat => ({
            'ID': cat.id,
            'Name': cat.name,
            'Description': cat.description,
            'Sort Order': cat.sortOrder,
            'Active': cat.activeFlag,
            'Tenant ID': cat.tenantId
        }));
        const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
        XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');

        // Create menu items worksheet
        const menuItemsData = menuItems.map(item => {
            const category = categories.find(cat => cat.id === item.categoryId);
            return {
                'ID': item.id,
                'Name': item.name,
                'Description': item.description,
                'Price': item.price,
                'Currency': item.currency,
                'Category ID': item.categoryId,
                'Category Name': category?.name || '',
                'Special Type': item.specialType || '',
                'Allergens': item.allergens.join('; '),
                'Availability Flag': item.availabilityFlag,
                'Sold Out': item.soldOut,
                'Prep Time (min)': item.prepTime || '',
                'Calories': item.calories || '',
                'Max Order Qty': item.maxOrderQty || '',
                'BOGO': item.bogo,
                'Complimentary': item.complimentary || '',
                'Image Orientation': item.imageOrientation || '',
                'Created At': item.createdAt,
                'Updated At': item.updatedAt
            };
        });
        const menuItemsSheet = XLSX.utils.json_to_sheet(menuItemsData);
        XLSX.utils.book_append_sheet(workbook, menuItemsSheet, 'Menu Items');

        // Create summary worksheet
        const summaryData = [
            { 'Metric': 'Total Categories', 'Value': categories.length },
            { 'Metric': 'Total Menu Items', 'Value': menuItems.length },
            { 'Metric': 'Available Items', 'Value': menuItems.filter(item => !item.soldOut).length },
            { 'Metric': 'Total Menu Value', 'Value': menuItems.reduce((sum, item) => sum + item.price, 0) },
            { 'Metric': 'Average Price', 'Value': menuItems.length > 0 ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length : 0 },
            { 'Metric': 'Export Date', 'Value': new Date().toISOString() }
        ];
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

        // Download file
        XLSX.writeFile(workbook, `menu-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    /**
     * Import from CSV format
     */
    private async importFromCSV(file: File): Promise<ImportResult> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csv = e.target?.result as string;
                    const lines = csv.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    
                    const importedItems: MenuItem[] = [];
                    const errors: string[] = [];

                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue;
                        
                        try {
                            const values = this.parseCSVLine(lines[i]);
                            const item = this.createMenuItemFromCSV(values, headers);
                            if (item) {
                                importedItems.push(item);
                            }
                        } catch (error) {
                            errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
                        }
                    }

                    resolve({
                        success: importedItems.length > 0,
                        message: `Successfully imported ${importedItems.length} items${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
                        importedItems,
                        errors: errors.length > 0 ? errors : undefined
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        message: `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        errors: [error instanceof Error ? error.message : 'Unknown error']
                    });
                }
            };
            reader.readAsText(file);
        });
    }

    /**
     * Import from JSON format
     */
    private async importFromJSON(file: File): Promise<ImportResult> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = e.target?.result as string;
                    const data = JSON.parse(json);
                    
                    let importedItems: MenuItem[] = [];
                    let importedCategories: MenuCategory[] = [];
                    let errors: string[] = [];

                    if (data.menuItems && Array.isArray(data.menuItems)) {
                        importedItems = data.menuItems.filter((item: any) => this.validateMenuItem(item));
                    }

                    if (data.categories && Array.isArray(data.categories)) {
                        importedCategories = data.categories.filter((cat: any) => this.validateCategory(cat));
                    }

                    resolve({
                        success: importedItems.length > 0 || importedCategories.length > 0,
                        message: `Successfully imported ${importedItems.length} items and ${importedCategories.length} categories`,
                        importedItems,
                        importedCategories
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        message: `Failed to parse JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        errors: [error instanceof Error ? error.message : 'Unknown error']
                    });
                }
            };
            reader.readAsText(file);
        });
    }

    /**
     * Import from XLSX format
     */
    private async importFromXLSX(file: File): Promise<ImportResult> {
        if (typeof XLSX === 'undefined') {
            return {
                success: false,
                message: 'XLSX library not available. Please install xlsx package for Excel import.',
                errors: ['XLSX library not available']
            };
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    let importedItems: MenuItem[] = [];
                    let importedCategories: MenuCategory[] = [];
                    let errors: string[] = [];

                    // Import categories
                    if (workbook.Sheets['Categories']) {
                        const categoriesData = XLSX.utils.sheet_to_json(workbook.Sheets['Categories']);
                        importedCategories = categoriesData.filter((cat: any) => this.validateCategory(cat));
                    }

                    // Import menu items
                    if (workbook.Sheets['Menu Items']) {
                        const menuItemsData = XLSX.utils.sheet_to_json(workbook.Sheets['Menu Items']);
                        importedItems = menuItemsData.filter((item: any) => this.validateMenuItem(item));
                    }

                    resolve({
                        success: importedItems.length > 0 || importedCategories.length > 0,
                        message: `Successfully imported ${importedItems.length} items and ${importedCategories.length} categories`,
                        importedItems,
                        importedCategories
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        message: `Failed to parse XLSX file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        errors: [error instanceof Error ? error.message : 'Unknown error']
                    });
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Parse CSV line with proper handling of quoted values
     */
    private parseCSVLine(line: string): string[] {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * Create MenuItem from CSV values
     */
    private createMenuItemFromCSV(values: string[], headers: string[]): MenuItem | null {
        const getValue = (header: string) => {
            const index = headers.findIndex(h => h.toLowerCase().includes(header.toLowerCase()));
            return index >= 0 ? values[index] : '';
        };

        const id = getValue('ID') || this.generateId();
        const name = getValue('Name').replace(/"/g, '');
        const description = getValue('Description').replace(/"/g, '');
        const price = parseFloat(getValue('Price')) || 0;
        const currency = getValue('Currency') as any || 'USD';
        const categoryId = getValue('Category ID') || this.generateId();

        if (!name || !description) return null;

        return {
            id,
            name,
            description,
            price,
            currency,
            imageUrl: '',
            allergens: getValue('Allergens') ? getValue('Allergens').split(';').map(a => a.trim()) : [],
            categoryId,
            availabilityFlag: getValue('Availability Flag') === 'true',
            tenantId: 'tenant-123',
            createdAt: getValue('Created At') || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            soldOut: getValue('Sold Out') === 'true',
            bogo: getValue('BOGO') === 'true',
            specialType: getValue('Special Type') as any || undefined,
            prepTime: parseInt(getValue('Prep Time')) || undefined,
            calories: parseInt(getValue('Calories')) || undefined,
            maxOrderQty: parseInt(getValue('Max Order Qty')) || undefined,
            complimentary: getValue('Complimentary') || undefined,
            imageOrientation: getValue('Image Orientation') as any || undefined
        };
    }

    /**
     * Validate MenuItem data
     */
    private validateMenuItem(item: any): boolean {
        return item && 
               typeof item.name === 'string' && 
               typeof item.description === 'string' && 
               typeof item.price === 'number' &&
               typeof item.categoryId === 'string';
    }

    /**
     * Validate Category data
     */
    private validateCategory(cat: any): boolean {
        return cat && 
               typeof cat.name === 'string' && 
               typeof cat.description === 'string';
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

export const exportImportService = new ExportImportService();
