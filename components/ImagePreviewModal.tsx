import React from 'react';
import { XIcon } from './Icons';

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, imageUrl }) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-white p-4 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] transform transition-all"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside the image container
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 text-gray-200 bg-gray-800 bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Close image preview"
                >
                    <XIcon className="h-6 w-6" />
                </button>
                <img 
                    src={imageUrl} 
                    alt="Menu item preview" 
                    className="object-contain w-full h-full max-h-[85vh]" 
                />
            </div>
        </div>
    );
};

export default ImagePreviewModal;
