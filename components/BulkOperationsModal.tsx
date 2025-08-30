import React, { useState, useEffect } from 'react';
import { MenuItem, SpecialType, Allergen, Currency } from '../types';
import { X, Save, AlertTriangle, CheckCircle } from 'lucide-react';

interface BulkOperationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: MenuItem[];
    onSave: (updatedItems: MenuItem[]) => void;
}

interface BulkEditData {
    price?: number;
    currency?: Currency;
    specialType?: SpecialType;
    allergens?: Allergen[];
    availabilityFlag?: boolean;
    soldOut?: boolean;
    prepTime?: number;
    calories?: number;
    maxOrderQty?: number;
    bogo?: boolean;
    complimentary?: string;
    imageOrientation?: '16:9' | '3:4' | '1:1';
}

const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
    isOpen,
    onClose,
    selectedItems,
    onSave
}) => {
    const [editData, setEditData] = useState<BulkEditData>({});
    const [selectedFields, setSelectedFields] = useState<Set<keyof BulkEditData>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setEditData({});
            setSelectedFields(new Set());
            setPreviewMode(false);
        }
    }, [isOpen]);

    const handleFieldToggle = (field: keyof BulkEditData) => {
        const newSelected = new Set(selectedFields);
        if (newSelected.has(field)) {
            newSelected.delete(field);
            const newEditData = { ...editData };
            delete newEditData[field];
            setEditData(newEditData);
        } else {
            newSelected.add(field);
        }
        setSelectedFields(newSelected);
    };

    const handleInputChange = (field: keyof BulkEditData, value: any) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (selectedFields.size === 0) return;

        setIsSaving(true);
        try {
            const updatedItems = selectedItems.map(item => ({
                ...item,
                ...editData,
                updatedAt: new Date().toISOString()
            }));

            await onSave(updatedItems);
            onClose();
        } catch (error) {
            console.error('Error saving bulk updates:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const getFieldValue = (field: keyof BulkEditData) => {
        if (!editData[field]) return '';
        
        if (field === 'allergens' && Array.isArray(editData[field])) {
            return (editData[field] as Allergen[]).join(', ');
        }
        
        return editData[field];
    };

    const renderFieldInput = (field: keyof BulkEditData) => {
        switch (field) {
            case 'price':
                return (
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={getFieldValue(field) || ''}
                        onChange={(e) => handleInputChange(field, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new price"
                    />
                );

            case 'currency':
                return (
                    <select
                        value={getFieldValue(field) || ''}
                        onChange={(e) => handleInputChange(field, e.target.value as Currency)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select currency</option>
                        {Object.values(Currency).map(currency => (
                            <option key={currency} value={currency}>{currency}</option>
                        ))}
                    </select>
                );

            case 'specialType':
                return (
                    <select
                        value={getFieldValue(field) || ''}
                        onChange={(e) => handleInputChange(field, e.target.value as SpecialType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select special type</option>
                        {Object.values(SpecialType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                );

            case 'allergens':
                return (
                    <div className="space-y-2">
                        {Object.values(Allergen).map(allergen => (
                            <label key={allergen} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={(editData.allergens || []).includes(allergen)}
                                    onChange={(e) => {
                                        const current = editData.allergens || [];
                                        if (e.target.checked) {
                                            handleInputChange(field, [...current, allergen]);
                                        } else {
                                            handleInputChange(field, current.filter(a => a !== allergen));
                                        }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{allergen}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'availabilityFlag':
            case 'soldOut':
            case 'bogo':
                return (
                    <select
                        value={getFieldValue(field)?.toString() || ''}
                        onChange={(e) => handleInputChange(field, e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                );

            case 'prepTime':
            case 'calories':
            case 'maxOrderQty':
                return (
                    <input
                        type="number"
                        min="0"
                        value={getFieldValue(field) || ''}
                        onChange={(e) => handleInputChange(field, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter new ${field}`}
                    />
                );

            case 'complimentary':
                return (
                    <input
                        type="text"
                        value={getFieldValue(field) || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter complimentary item"
                    />
                );

            case 'imageOrientation':
                return (
                    <select
                        value={getFieldValue(field) || ''}
                        onChange={(e) => handleInputChange(field, e.target.value as '16:9' | '3:4' | '1:1')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select orientation</option>
                        <option value="16:9">Landscape (16:9)</option>
                        <option value="3:4">Portrait (3:4)</option>
                        <option value="1:1">Square (1:1)</option>
                    </select>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
                        <p className="text-gray-600">
                            Update {selectedItems.length} selected menu item(s)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Field Selection */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Fields to Update</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {([
                                'price', 'currency', 'specialType', 'allergens', 'availabilityFlag',
                                'soldOut', 'prepTime', 'calories', 'maxOrderQty', 'bogo',
                                'complimentary', 'imageOrientation'
                            ] as const).map(field => (
                                <label key={field} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={selectedFields.has(field)}
                                        onChange={() => handleFieldToggle(field)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Field Inputs */}
                    {selectedFields.size > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Values</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from(selectedFields).map((field: keyof BulkEditData) => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                            {field.toString().replace(/([A-Z])/g, ' $1').trim()}
                                        </label>
                                        {renderFieldInput(field)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview Mode Toggle */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={previewMode}
                                onChange={(e) => setPreviewMode(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Preview changes before saving</span>
                        </label>
                    </div>

                    {/* Preview */}
                    {previewMode && selectedFields.size > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Changes</h3>
                            <div className="space-y-2">
                                {Array.from(selectedFields).map((field: keyof BulkEditData) => (
                                    <div key={field} className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-700 capitalize">
                                            {field.toString().replace(/([A-Z])/g, ' $1').trim()}:
                                        </span>
                                        <span className="text-gray-600">
                                            {getFieldValue(field)?.toString() || 'Not set'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warning */}
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                                Warning: This action will update {selectedItems.length} menu item(s)
                            </span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                            Make sure to review your changes before proceeding. This action cannot be undone.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={selectedFields.size === 0 || isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkOperationsModal;
