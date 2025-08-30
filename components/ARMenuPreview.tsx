import React, { useState, useEffect, useRef } from 'react';
import { MenuItem } from '../types';
import { 
    ARScene, 
    ARPreviewOptions, 
    arMenuPreviewService 
} from '../services/arMenuPreviewService';
import { 
    Eye, EyeOff, Camera, RotateCcw, ZoomIn, ZoomOut, 
    Move, Info, Settings, Play, Square, RefreshCw,
    Smartphone, Monitor, Vr, Globe, Download, Share2
} from 'lucide-react';

interface ARMenuPreviewProps {
    menuItem: MenuItem;
    onClose?: () => void;
}

const ARMenuPreview: React.FC<ARMenuPreviewProps> = ({ menuItem, onClose }) => {
    const [arScene, setArScene] = useState<ARScene | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isARMode, setIsARMode] = useState(false);
    const [is3DMode, setIs3DMode] = useState(true);
    const [previewOptions, setPreviewOptions] = useState<ARPreviewOptions>({
        enableAR: false,
        enable3D: true,
        enableInteractions: true,
        quality: 'medium',
        platform: 'web'
    });
    const [showSettings, setShowSettings] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [currentView, setCurrentView] = useState<'3d' | 'ar' | 'info'>('3d');
    
    const containerRef = useRef<HTMLDivElement>(null);
    const arSessionRef = useRef<any>(null);

    useEffect(() => {
        initializePreview();
        return () => {
            cleanup();
        };
    }, [menuItem]);

    const initializePreview = async () => {
        setIsLoading(true);
        try {
            const scene = await arMenuPreviewService.createARPreview(menuItem, previewOptions);
            setArScene(scene);
            
            if (containerRef.current && scene) {
                await arMenuPreviewService.render3DPreview(scene, containerRef.current);
            }
        } catch (error) {
            console.error('Failed to initialize AR preview:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const cleanup = () => {
        if (arSessionRef.current) {
            arMenuPreviewService.dispose();
        }
    };

    const startARSession = async () => {
        if (!arScene) return;

        try {
            setIsLoading(true);
            const success = await arMenuPreviewService.startARSession(arScene);
            
            if (success) {
                setIsARMode(true);
                setCurrentView('ar');
                // This would start the actual AR session
                console.log('AR session started successfully');
            } else {
                alert('Failed to start AR session. Please check if your device supports AR.');
            }
        } catch (error) {
            console.error('AR session failed:', error);
            alert('Failed to start AR session. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const stopARSession = () => {
        setIsARMode(false);
        setCurrentView('3d');
        // This would stop the actual AR session
        console.log('AR session stopped');
    };

    const toggle3DMode = () => {
        setIs3DMode(!is3DMode);
        if (is3DMode) {
            setCurrentView('info');
        } else {
            setCurrentView('3d');
            if (containerRef.current && arScene) {
                arMenuPreviewService.render3DPreview(arScene, containerRef.current);
            }
        }
    };

    const changeQuality = (quality: 'low' | 'medium' | 'high') => {
        setPreviewOptions(prev => ({ ...prev, quality }));
        // Reinitialize with new quality
        setTimeout(initializePreview, 100);
    };

    const changePlatform = (platform: 'web' | 'mobile' | 'vr') => {
        setPreviewOptions(prev => ({ ...prev, platform }));
        // Reinitialize with new platform
        setTimeout(initializePreview, 100);
    };

    const downloadModel = () => {
        if (arScene) {
            // This would download the 3D model
            const link = document.createElement('a');
            link.href = arScene.models[0]?.modelUrl || '#';
            link.download = `${menuItem.name}-3D-model.glb`;
            link.click();
        }
    };

    const sharePreview = () => {
        if (navigator.share) {
            navigator.share({
                title: `3D Preview: ${menuItem.name}`,
                text: `Check out this 3D preview of ${menuItem.name}!`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 text-center">
                    <RefreshCw className="w-12 h-12 mx-auto animate-spin text-blue-600 mb-4" />
                    <div className="text-lg font-semibold text-gray-900 mb-2">Loading 3D Preview</div>
                    <div className="text-gray-600">Preparing {menuItem.name} for AR/3D viewing...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">🍽️ AR Preview: {menuItem.name}</h2>
                        <p className="text-gray-600">Experience your menu item in 3D and Augmented Reality</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Item Information"
                        >
                            <Info className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Preview Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Close Preview"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex h-[calc(90vh-120px)]">
                    {/* Preview Area */}
                    <div className="flex-1 relative">
                        {/* View Toggle */}
                        <div className="absolute top-4 left-4 z-10">
                            <div className="flex space-x-1 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
                                <button
                                    onClick={() => setCurrentView('3d')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        currentView === '3d' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Monitor className="w-4 h-4 inline mr-1" />
                                    3D View
                                </button>
                                <button
                                    onClick={() => setCurrentView('ar')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        currentView === 'ar' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Smartphone className="w-4 h-4 inline mr-1" />
                                    AR View
                                </button>
                                <button
                                    onClick={() => setCurrentView('info')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        currentView === 'info' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Info className="w-4 h-4 inline mr-1" />
                                    Info
                                </button>
                            </div>
                        </div>

                        {/* AR Controls */}
                        {currentView === 'ar' && (
                            <div className="absolute top-4 right-4 z-10">
                                <div className="flex space-x-2">
                                    {!isARMode ? (
                                        <button
                                            onClick={startARSession}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Play className="w-4 h-4 inline mr-2" />
                                            Start AR
                                        </button>
                                    ) : (
                                        <button
                                            onClick={stopARSession}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Square className="w-4 h-4 inline mr-2" />
                                            Stop AR
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3D Controls */}
                        {currentView === '3d' && (
                            <div className="absolute top-4 right-4 z-10">
                                <div className="flex space-x-2">
                                    <button className="p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                                        <RotateCcw className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                                        <ZoomIn className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                                        <ZoomOut className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                                        <Move className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Preview Container */}
                        <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                            {currentView === 'info' && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center p-8">
                                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                                            <span className="text-4xl">🍽️</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{menuItem.name}</h3>
                                        <p className="text-gray-600 mb-6 max-w-md">{menuItem.description}</p>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="font-semibold text-blue-900">${menuItem.price}</div>
                                                <div className="text-blue-700">Price</div>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <div className="font-semibold text-green-900">{menuItem.calories || 'N/A'}</div>
                                                <div className="text-green-700">Calories</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AR Status */}
                        {currentView === 'ar' && (
                            <div className="absolute bottom-4 left-4 z-10">
                                <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isARMode ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                        <span className="text-sm">
                                            {isARMode ? 'AR Active' : 'AR Ready'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
                        {/* Settings Panel */}
                        {showSettings && (
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Settings</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                                        <select
                                            value={previewOptions.quality}
                                            onChange={(e) => changeQuality(e.target.value as 'low' | 'medium' | 'high')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="low">Low (Fast)</option>
                                            <option value="medium">Medium (Balanced)</option>
                                            <option value="high">High (Best)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                                        <select
                                            value={previewOptions.platform}
                                            onChange={(e) => changePlatform(e.target.value as 'web' | 'mobile' | 'vr')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="web">Web Browser</option>
                                            <option value="mobile">Mobile Device</option>
                                            <option value="vr">VR Headset</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={previewOptions.enable3D}
                                                onChange={(e) => setPreviewOptions(prev => ({ ...prev, enable3D: e.target.checked }))}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Enable 3D Rendering</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={previewOptions.enableInteractions}
                                                onChange={(e) => setPreviewOptions(prev => ({ ...prev, enableInteractions: e.target.checked }))}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Enable Interactions</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Panel */}
                        {showInfo && (
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Name</div>
                                        <div className="text-gray-900">{menuItem.name}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Description</div>
                                        <div className="text-gray-900">{menuItem.description}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Price</div>
                                        <div className="text-gray-900">${menuItem.price} {menuItem.currency}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Special Type</div>
                                        <div className="text-gray-900">{menuItem.specialType || 'None'}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Allergens</div>
                                        <div className="text-gray-900">
                                            {menuItem.allergens.length > 0 ? menuItem.allergens.join(', ') : 'None'}
                                        </div>
                                    </div>
                                    
                                    {menuItem.calories && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-700">Calories</div>
                                            <div className="text-gray-900">{menuItem.calories} kcal</div>
                                        </div>
                                    )}
                                    
                                    {menuItem.prepTime && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-700">Prep Time</div>
                                            <div className="text-gray-900">{menuItem.prepTime} minutes</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Default Sidebar Content */}
                        {!showSettings && !showInfo && (
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                
                                <div className="space-y-3">
                                    <button
                                        onClick={downloadModel}
                                        className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download 3D Model
                                    </button>
                                    
                                    <button
                                        onClick={sharePreview}
                                        className="w-full flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        Share Preview
                                    </button>
                                    
                                    <button
                                        onClick={() => setShowInfo(true)}
                                        className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                                    >
                                        <Info className="w-5 h-5" />
                                        View Details
                                    </button>
                                </div>

                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="text-sm text-yellow-800">
                                        <div className="font-medium mb-2">💡 Tips:</div>
                                        <ul className="space-y-1 text-xs">
                                            <li>• Use mouse to rotate 3D model</li>
                                            <li>• Scroll to zoom in/out</li>
                                            <li>• Right-click to pan</li>
                                            <li>• AR works best on mobile devices</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Missing icon component
const X = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default ARMenuPreview;
