import React, { useRef, useState } from 'react';
import { MenuCategory } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, PlusCircleIcon, UploadIcon, DownloadIcon, LoadingSpinnerIcon, DragHandleIcon, QRIcon } from './Icons';

interface CategoryListProps {
    categories: MenuCategory[];
    onAddCategory: () => void;
    onEditCategory: (category: MenuCategory) => void;
    onDeleteCategory: (categoryId: string) => void;
    onSelectCategory: (category: MenuCategory) => void;
    onAddItemToCategory: (category: MenuCategory) => void;
    onUploadExcel: (file: File) => void;
    onExportExcel: () => void;
    isExporting: boolean;
    onReorderCategories: (reorderedCategories: MenuCategory[]) => void;
    onGenerateQR: (category: MenuCategory | null) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onAddCategory, onEditCategory, onDeleteCategory, onSelectCategory, onAddItemToCategory, onUploadExcel, onExportExcel, isExporting, onReorderCategories, onGenerateQR }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const draggedItemId = useRef<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUploadExcel(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
        draggedItemId.current = id;
        e.dataTransfer.effectAllowed = 'move';
        // A slight delay to allow the browser to capture the snapshot of the element before we change its style
        setTimeout(() => {
            e.currentTarget.classList.add('opacity-50', 'bg-primary-50');
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.currentTarget.classList.remove('opacity-50', 'bg-primary-50');
        draggedItemId.current = null;
        setDragOverId(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
        e.preventDefault();
        if (id !== draggedItemId.current) {
            setDragOverId(id);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, dropTargetId: string) => {
        e.preventDefault();
        if (!draggedItemId.current || draggedItemId.current === dropTargetId) {
            setDragOverId(null);
            return;
        }

        const draggedIndex = categories.findIndex(c => c.id === draggedItemId.current);
        const dropTargetIndex = categories.findIndex(c => c.id === dropTargetId);
        
        if (draggedIndex === -1 || dropTargetIndex === -1) return;

        const reordered = Array.from(categories);
        const [draggedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(dropTargetIndex, 0, draggedItem);
        
        const categoriesWithUpdatedSortOrder = reordered.map((category, index) => ({
            ...category,
            sortOrder: index,
        }));

        onReorderCategories(categoriesWithUpdatedSortOrder);
        setDragOverId(null);
    };

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-slate-700">Menu Categories</h2>
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                     <button
                        onClick={handleUploadClick}
                        className="flex items-center bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-emerald-700 transition duration-300"
                    >
                        <UploadIcon className="h-5 w-5 mr-2" />
                        Upload Excel
                    </button>
                    <button
                        onClick={onExportExcel}
                        disabled={isExporting}
                        className="flex items-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700 transition duration-300 disabled:bg-sky-400 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <LoadingSpinnerIcon className="animate-spin h-5 w-5 mr-2" />
                        ) : (
                            <DownloadIcon className="h-5 w-5 mr-2" />
                        )}
                        {isExporting ? 'Exporting...' : 'Export Excel'}
                    </button>
                    <button
                        onClick={() => onGenerateQR(null)}
                        className="flex items-center bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-700 transition duration-300"
                        title="Generate QR code for all categories"
                    >
                        <QRIcon className="h-5 w-5 mr-2" />
                        Menu QR Code
                    </button>
                    <button
                        onClick={onAddCategory}
                        className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Category
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="py-3 px-2 w-12 text-center"></th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Description</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Status</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {categories.map(category => (
                            <tr
                                key={category.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, category.id)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, category.id)}
                                onDragLeave={() => setDragOverId(null)}
                                onDrop={(e) => handleDrop(e, category.id)}
                                className={`border-b border-slate-200 transition-all duration-300 ${dragOverId === category.id ? 'bg-primary-50 border-t-2 border-t-primary-500' : ''}`}
                            >
                                <td className="py-3 px-2 text-center text-slate-400 cursor-move">
                                    <DragHandleIcon className="h-5 w-5 inline-block" />
                                </td>
                                <td className="py-3 px-4 font-medium">{category.name}</td>
                                <td className="py-3 px-4">{category.description}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${category.activeFlag ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {category.activeFlag ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onSelectCategory(category)} className="text-sky-500 hover:text-sky-700 p-2 rounded-full hover:bg-sky-100 transition" title="View Items">
                                            <EyeIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onGenerateQR(category)} className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition" title="Generate QR Code">
                                            <QRIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onAddItemToCategory(category)} className="text-emerald-500 hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-100 transition" title="Add Item to Category">
                                            <PlusCircleIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onEditCategory(category)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Category">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onDeleteCategory(category.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Category">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {categories.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>No categories found. Click "Add Category" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryList;