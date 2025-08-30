import React, { useState, useEffect } from 'react';
import { MenuItem, Allergen, Currency, SpecialType, ImageOrientation } from '../types';
import { XIcon } from './Icons';

interface MenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (itemData: Omit<MenuItem, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => void;
    initialData: MenuItem | null;
    categoryId: string;
    availableAllergens: Allergen[];
    availableCurrencies: Currency[];
}

const getInitialFormData = () => ({
    name: '',
    description: '',
    price: 0,
    currency: Currency.USD,
    imageUrl: '',
    videoUrl: '',
    allergens: [] as Allergen[],
    availabilityFlag: true,
    displayName: '',
    itemCode: '',
    prepTime: 0,
    soldOut: false,
    portion: '',
    specialType: SpecialType.NONE,
    calories: 0,
    maxOrderQty: 10,
    bogo: false,
    complimentary: '',
    imageOrientation: ImageOrientation.SQUARE,
    availableTime: '',
    availableDate: '',
});

const MenuItemModal: React.FC<MenuItemModalProps> = ({ isOpen, onClose, onSubmit, initialData, categoryId, availableAllergens, availableCurrencies }) => {
    const [formData, setFormData] = useState(getInitialFormData());
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
    const nameCharLimit = 100;

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                price: initialData.price,
                currency: initialData.currency,
                imageUrl: initialData.imageUrl,
                videoUrl: initialData.videoUrl ?? '',
                allergens: initialData.allergens,
                availabilityFlag: initialData.availabilityFlag,
                displayName: initialData.displayName ?? '',
                itemCode: initialData.itemCode ?? '',
                prepTime: initialData.prepTime ?? 0,
                soldOut: initialData.soldOut ?? false,
                portion: initialData.portion ?? '',
                specialType: initialData.specialType ?? SpecialType.NONE,
                calories: initialData.calories ?? 0,
                maxOrderQty: initialData.maxOrderQty ?? 10,
                bogo: initialData.bogo ?? false,
                complimentary: initialData.complimentary ?? '',
                imageOrientation: initialData.imageOrientation ?? ImageOrientation.SQUARE,
                availableTime: initialData.availableTime ?? '',
                availableDate: initialData.availableDate ?? '',
            });
            setImagePreview(initialData.imageUrl);
        } else {
            setFormData(getInitialFormData());
            setImagePreview(null);
        }
        setErrors({}); // Clear errors when modal opens or data changes
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'availabilityFlag' || name === 'soldOut' || name === 'bogo') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        // Clear validation error for the field being edited
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleAllergenChange = (allergen: Allergen) => {
        setFormData(prev => {
            const newAllergens = prev.allergens.includes(allergen)
                ? prev.allergens.filter(a => a !== allergen)
                : [...prev.allergens, allergen];
            return { ...prev, allergens: newAllergens };
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                // In a real app, you'd upload this and get a URL. We'll use a placeholder.
                setFormData(prev => ({ ...prev, imageUrl: 'https://picsum.photos/400/300' }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const validate = (): boolean => {
        const newErrors: { name?: string; price?: string } = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Item Name is required.';
        } else if (formData.name.length > nameCharLimit) {
            newErrors.name = `Item Name cannot exceed ${nameCharLimit} characters.`;
        }

        // Price validation
        const priceValue = parseFloat(String(formData.price));
        if (isNaN(priceValue) || priceValue <= 0) {
            newErrors.price = 'Price must be a positive number.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const dataToSubmit = {
                ...formData,
                price: parseFloat(String(formData.price)) || 0,
                prepTime: parseInt(String(formData.prepTime), 10) || 0,
                calories: parseInt(String(formData.calories), 10) || 0,
                maxOrderQty: parseInt(String(formData.maxOrderQty), 10) || 0,
            };
             onSubmit({ ...dataToSubmit, categoryId });
        }
    };

    if (!isOpen) return null;

    const inputClass = "mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500";
    const labelClass = "block text-sm font-medium text-slate-700";
    const errorInputClass = "border-red-500 focus:ring-red-500 focus:border-red-500";

    const getCharCountClass = () => {
        const len = formData.name.length;
        if (len >= nameCharLimit) return 'text-red-600 font-medium';
        if (len >= nameCharLimit - 10) return 'text-yellow-600';
        return 'text-slate-500';
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b border-slate-200 z-10">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Food Item' : 'Food Item Registration'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className={labelClass}>Item Name*</label>
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={`${inputClass} ${errors.name ? errorInputClass : ''}`} required maxLength={nameCharLimit}/>
                                <div className="flex justify-between items-center mt-1">
                                    {errors.name ? (
                                        <p className="text-red-500 text-xs">{errors.name}</p>
                                    ) : (
                                        <div /> 
                                    )}
                                    <p className={`text-xs transition-colors ${getCharCountClass()}`}>
                                        {nameCharLimit - formData.name.length} characters remaining
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="itemCode" className={labelClass}>Item Code</label>
                                <input id="itemCode" name="itemCode" type="text" value={formData.itemCode} onChange={handleChange} className={inputClass} />
                            </div>
                             <div>
                                <label htmlFor="availableTime" className={labelClass}>Available Time Period</label>
                                <input id="availableTime" name="availableTime" type="text" value={formData.availableTime} onChange={handleChange} className={inputClass} placeholder="e.g., 09:00-14:00,18:00-22:00" />
                            </div>
                            <div>
                                <label htmlFor="availabilityFlag" className={labelClass}>Active Status</label>
                                <select id="availabilityFlag" name="availabilityFlag" value={String(formData.availabilityFlag)} onChange={handleChange} className={inputClass}>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description" className={labelClass}>Item Description</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="soldOut" className={labelClass}>Sold Out</label>
                                <select id="soldOut" name="soldOut" value={String(formData.soldOut)} onChange={handleChange} className={inputClass}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="portion" className={labelClass}>Portion Good For</label>
                                <input id="portion" name="portion" type="text" value={formData.portion} onChange={handleChange} className={inputClass} placeholder="e.g., 2 persons" />
                            </div>
                             <div>
                                <label className={labelClass}>Primary Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" /> : <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        <div className="flex text-sm text-slate-600 justify-center"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" /></label></div><p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="videoUrl" className={labelClass}>Secondary Video URL</label>
                                <input id="videoUrl" name="videoUrl" type="text" value={formData.videoUrl} onChange={handleChange} className={inputClass} placeholder="https://example.com/video.mp4" />
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="displayName" className={labelClass}>Item Display Name</label>
                                <input id="displayName" name="displayName" type="text" value={formData.displayName} onChange={handleChange} className={inputClass} />
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-grow">
                                    <label htmlFor="price" className={labelClass}>Price*</label>
                                    <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} step="0.01" min="0" className={`${inputClass} ${errors.price ? errorInputClass : ''}`} required />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label htmlFor="currency" className={labelClass}>Currency</label>
                                    <select id="currency" name="currency" value={formData.currency} onChange={handleChange} className={inputClass}>
                                        {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="prepTime" className={labelClass}>Preparation Time in Minutes</label>
                                <input id="prepTime" name="prepTime" type="number" value={formData.prepTime} onChange={handleChange} className={inputClass} min="0" />
                            </div>
                             <div>
                                <label htmlFor="availableDate" className={labelClass}>Available Date Period</label>
                                <input id="availableDate" name="availableDate" type="text" value={formData.availableDate} onChange={handleChange} className={inputClass} placeholder="e.g., 2024/01/01-2024/01/31" />
                            </div>
                            <div>
                                <label htmlFor="specialType" className={labelClass}>Special Type</label>
                                <select id="specialType" name="specialType" value={formData.specialType} onChange={handleChange} className={inputClass}>
                                    {Object.values(SpecialType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="calories" className={labelClass}>Calorific Value</label>
                                <input id="calories" name="calories" type="number" value={formData.calories} onChange={handleChange} className={inputClass} min="0" />
                            </div>
                            <div>
                                <label htmlFor="maxOrderQty" className={labelClass}>Max Order Quantity</label>
                                <input id="maxOrderQty" name="maxOrderQty" type="number" value={formData.maxOrderQty} onChange={handleChange} className={inputClass} min="0" />
                            </div>
                             <div>
                                <label htmlFor="bogo" className={labelClass}>BOGO (Buy One Get One)</label>
                                <select id="bogo" name="bogo" value={String(formData.bogo)} onChange={handleChange} className={inputClass}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="complimentary" className={labelClass}>Complimentary Offering</label>
                                <input id="complimentary" name="complimentary" type="text" value={formData.complimentary} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="imageOrientation" className={labelClass}>Image Orientation</label>
                                <select id="imageOrientation" name="imageOrientation" value={formData.imageOrientation} onChange={handleChange} className={inputClass}>
                                    {Object.values(ImageOrientation).map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Allergens</label>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                {availableAllergens.map(allergen => (
                                    <div key={allergen} className="flex items-center">
                                        <input id={`allergen-${allergen}`} type="checkbox" checked={formData.allergens.includes(allergen)} onChange={() => handleAllergenChange(allergen)} className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                                        <label htmlFor={`allergen-${allergen}`} className="ml-2 text-sm text-slate-700">{allergen}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 sticky bottom-0 z-10 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuItemModal;