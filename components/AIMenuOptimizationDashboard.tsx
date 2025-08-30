import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '../types';
import { 
    MenuOptimizationSuggestion, 
    DemandForecast, 
    InventoryOptimization,
    SalesData,
    aiMenuOptimizationService 
} from '../services/aiMenuOptimizationService';
import { 
    TrendingUp, TrendingDown, Lightbulb, Target, BarChart3, 
    DollarSign, Package, AlertTriangle, CheckCircle, XCircle,
    Play, Pause, RefreshCw, Download, Upload
} from 'lucide-react';

interface AIMenuOptimizationDashboardProps {
    menuItems: MenuItem[];
    categories: MenuCategory[];
}

const AIMenuOptimizationDashboard: React.FC<AIMenuOptimizationDashboardProps> = ({
    menuItems,
    categories
}) => {
    const [suggestions, setSuggestions] = useState<MenuOptimizationSuggestion[]>([]);
    const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>([]);
    const [inventoryOptimizations, setInventoryOptimizations] = useState<InventoryOptimization[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
    const [selectedView, setSelectedView] = useState<'suggestions' | 'forecasts' | 'inventory'>('suggestions');

    // Mock sales data for demonstration
    const mockSalesData: SalesData[] = menuItems.map(item => ({
        itemId: item.id,
        itemName: item.name,
        salesCount: Math.floor(Math.random() * 100) + 10,
        revenue: (Math.floor(Math.random() * 100) + 10) * item.price,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        categoryId: item.categoryId
    }));

    // Mock current inventory
    const mockCurrentInventory: Record<string, number> = {};
    menuItems.forEach(item => {
        mockCurrentInventory[item.id] = Math.floor(Math.random() * 50) + 5;
    });

    useEffect(() => {
        if (menuItems.length > 0) {
            analyzeMenu();
        }
    }, [menuItems, categories, selectedTimeframe]);

    const analyzeMenu = async () => {
        setIsAnalyzing(true);
        try {
            // Analyze menu performance
            const menuSuggestions = await aiMenuOptimizationService.analyzeMenuPerformance(
                menuItems,
                categories,
                mockSalesData
            );
            setSuggestions(menuSuggestions);

            // Forecast demand
            const forecasts = await aiMenuOptimizationService.forecastDemand(
                menuItems,
                mockSalesData,
                selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90
            );
            setDemandForecasts(forecasts);

            // Optimize inventory
            const inventoryOpts = await aiMenuOptimizationService.optimizeInventory(
                menuItems,
                forecasts,
                mockCurrentInventory
            );
            setInventoryOptimizations(inventoryOpts);

        } catch (error) {
            console.error('AI analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertTriangle className="w-4 h-4" />;
            case 'medium': return <Target className="w-4 h-4" />;
            case 'low': return <CheckCircle className="w-4 h-4" />;
            default: return <Lightbulb className="w-4 h-4" />;
        }
    };

    const getSuggestionIcon = (type: string) => {
        switch (type) {
            case 'add': return <Plus className="w-4 h-4" />;
            case 'remove': return <XCircle className="w-4 h-4" />;
            case 'modify': return <Edit3 className="w-4 h-4" />;
            case 'reprice': return <DollarSign className="w-4 h-4" />;
            case 'reposition': return <Move className="w-4 h-4" />;
            default: return <Lightbulb className="w-4 h-4" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />;
            default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStockoutRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">🤖 AI Menu Optimization</h2>
                    <p className="text-gray-600">AI-powered insights and predictive analytics for your menu</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d')}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                    <button
                        onClick={analyzeMenu}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setSelectedView('suggestions')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedView === 'suggestions'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Lightbulb className="w-4 h-4 inline mr-2" />
                    AI Suggestions
                </button>
                <button
                    onClick={() => setSelectedView('forecasts')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedView === 'forecasts'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Demand Forecasts
                </button>
                <button
                    onClick={() => setSelectedView('inventory')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedView === 'inventory'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Package className="w-4 h-4 inline mr-2" />
                    Inventory Optimization
                </button>
            </div>

            {/* AI Suggestions View */}
            {selectedView === 'suggestions' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            AI-Powered Menu Suggestions ({suggestions.length})
                        </h3>
                        <div className="text-sm text-gray-600">
                            Based on {selectedTimeframe} of sales data
                        </div>
                    </div>

                    {suggestions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {isAnalyzing ? (
                                <div className="space-y-3">
                                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                                    <p>Analyzing your menu data...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Lightbulb className="w-8 h-8 mx-auto text-gray-400" />
                                    <p>No suggestions available. Click "Refresh Analysis" to generate insights.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getSuggestionIcon(suggestion.type)}
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                                                <p className="text-sm text-gray-600">{suggestion.description}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                                            {getPriorityIcon(suggestion.priority)}
                                            <span className="ml-1 capitalize">{suggestion.priority}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                ${suggestion.impact.revenue.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-blue-700">Revenue Impact</div>
                                        </div>
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {(suggestion.impact.popularity * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-sm text-green-700">Popularity Impact</div>
                                        </div>
                                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {(suggestion.impact.efficiency * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-sm text-purple-700">Efficiency Impact</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="font-medium text-gray-700 mb-1">Recommended Action:</div>
                                            <div className="text-gray-900">{suggestion.action}</div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-700 mb-1">AI Reasoning:</div>
                                            <div className="text-gray-900">{suggestion.reasoning}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                                            Apply Suggestion
                                        </button>
                                        <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">
                                            Learn More
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Demand Forecasts View */}
            {selectedView === 'forecasts' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Demand Forecasting ({demandForecasts.length} items)
                        </h3>
                        <div className="text-sm text-gray-600">
                            Predictions for next {selectedTimeframe}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {demandForecasts.map((forecast, index) => (
                            <div key={index} className="bg-white rounded-lg border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900">{forecast.itemName}</h4>
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(forecast.trend)}
                                        <span className="text-sm text-gray-600 capitalize">{forecast.trend}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900">{forecast.currentDemand.toFixed(1)}</div>
                                        <div className="text-sm text-gray-600">Current Daily</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-blue-600">{forecast.predictedDemand.toFixed(1)}</div>
                                        <div className="text-sm text-gray-600">Predicted Daily</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-purple-600">{forecast.recommendedInventory}</div>
                                        <div className="text-sm text-gray-600">Recommended Stock</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-green-600">{(forecast.confidence * 100).toFixed(0)}%</div>
                                        <div className="text-sm text-gray-600">Confidence</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Seasonality:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            forecast.seasonality === 'high' ? 'bg-orange-100 text-orange-800' :
                                            forecast.seasonality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {forecast.seasonality}
                                        </span>
                                    </div>
                                    <div className="text-gray-600">
                                        Last updated: {new Date().toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inventory Optimization View */}
            {selectedView === 'inventory' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Inventory Optimization ({inventoryOptimizations.length} items)
                        </h3>
                        <div className="text-sm text-gray-600">
                            Stock level recommendations
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {inventoryOptimizations.map((optimization, index) => (
                            <div key={index} className="bg-white rounded-lg border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900">{optimization.itemName}</h4>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStockoutRiskColor(optimization.stockoutRisk)}`}>
                                        {optimization.stockoutRisk} risk
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900">{optimization.currentStock}</div>
                                        <div className="text-sm text-gray-600">Current Stock</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-blue-600">{optimization.recommendedStock}</div>
                                        <div className="text-sm text-gray-600">Recommended</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-orange-600">{optimization.reorderPoint}</div>
                                        <div className="text-sm text-gray-600">Reorder Point</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-purple-600">{optimization.reorderQuantity}</div>
                                        <div className="text-sm text-gray-600">Reorder Qty</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Holding Cost:</span>
                                        <span className="font-medium">${optimization.holdingCost.toFixed(2)}/month</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Stock Status:</span>
                                        <span className={`font-medium ${
                                            optimization.currentStock < optimization.reorderPoint ? 'text-red-600' :
                                            optimization.currentStock < optimization.reorderPoint * 1.5 ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                            {optimization.currentStock < optimization.reorderPoint ? 'Low Stock' :
                                             optimization.currentStock < optimization.reorderPoint * 1.5 ? 'Medium Stock' :
                                             'Well Stocked'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                                        Place Order
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                                        Adjust Stock
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <Download className="w-6 h-6 text-blue-600" />
                        <div className="text-left">
                            <div className="font-medium text-blue-900">Export Report</div>
                            <div className="text-sm text-blue-700">Download AI insights</div>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <Play className="w-6 h-6 text-green-600" />
                        <div className="text-left">
                            <div className="font-medium text-green-900">Auto-Optimize</div>
                            <div className="text-sm text-green-700">Apply top suggestions</div>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                        <div className="text-left">
                            <div className="font-medium text-purple-900">Schedule Analysis</div>
                            <div className="text-sm text-purple-700">Set up recurring reports</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Missing icon components
const Plus = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const Edit3 = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const Move = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
);

export default AIMenuOptimizationDashboard;
