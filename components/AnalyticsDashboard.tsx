import React, { useState, useMemo } from 'react';
import { MenuItem, MenuCategory, Currency } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Star, BarChart3, PieChart, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
    menuItems: MenuItem[];
    categories: MenuCategory[];
}

interface SalesMetric {
    label: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    color: string;
}

interface CategoryPerformance {
    categoryId: string;
    categoryName: string;
    itemCount: number;
    totalValue: number;
    averagePrice: number;
    percentage: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ menuItems, categories }) => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [selectedMetric, setSelectedMetric] = useState<'sales' | 'items' | 'categories'>('sales');

    // Calculate key metrics
    const metrics = useMemo((): SalesMetric[] => {
        const totalItems = menuItems.length;
        const availableItems = menuItems.filter(item => !item.soldOut).length;
        const totalValue = menuItems.reduce((sum, item) => sum + item.price, 0);
        const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;
        const premiumItems = menuItems.filter(item => item.price > averagePrice * 1.5).length;

        return [
            {
                label: 'Total Menu Items',
                value: totalItems,
                change: 12.5,
                trend: 'up',
                icon: <BarChart3 className="w-6 h-6" />,
                color: 'bg-blue-500'
            },
            {
                label: 'Available Items',
                value: availableItems,
                change: -2.3,
                trend: 'down',
                icon: <Users className="w-6 h-6" />,
                color: 'bg-green-500'
            },
            {
                label: 'Total Menu Value',
                value: totalValue,
                change: 8.7,
                trend: 'up',
                icon: <DollarSign className="w-6 h-6" />,
                color: 'bg-purple-500'
            },
            {
                label: 'Average Price',
                value: averagePrice,
                change: 5.2,
                trend: 'up',
                icon: <TrendingUp className="w-6 h-6" />,
                color: 'bg-orange-500'
            },
            {
                label: 'Premium Items',
                value: premiumItems,
                change: 15.8,
                trend: 'up',
                icon: <Star className="w-6 h-6" />,
                color: 'bg-pink-500'
            },
            {
                label: 'Categories',
                value: categories.length,
                change: 0,
                trend: 'neutral',
                icon: <PieChart className="w-6 h-6" />,
                color: 'bg-indigo-500'
            }
        ];
    }, [menuItems, categories]);

    // Calculate category performance
    const categoryPerformance = useMemo((): CategoryPerformance[] => {
        const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
        const performance = new Map<string, CategoryPerformance>();

        menuItems.forEach(item => {
            const categoryId = item.categoryId;
            const categoryName = categoryMap.get(categoryId) || 'Unknown';
            
            if (!performance.has(categoryId)) {
                performance.set(categoryId, {
                    categoryId,
                    categoryName,
                    itemCount: 0,
                    totalValue: 0,
                    averagePrice: 0,
                    percentage: 0
                });
            }

            const cat = performance.get(categoryId)!;
            cat.itemCount++;
            cat.totalValue += item.price;
        });

        // Calculate averages and percentages
        const totalItems = menuItems.length;
        performance.forEach(cat => {
            cat.averagePrice = cat.itemCount > 0 ? cat.totalValue / cat.itemCount : 0;
            cat.percentage = totalItems > 0 ? (cat.itemCount / totalItems) * 100 : 0;
        });

        return Array.from(performance.values())
            .sort((a, b) => b.itemCount - a.itemCount);
    }, [menuItems, categories]);

    // Calculate price distribution
    const priceDistribution = useMemo(() => {
        const ranges = [
            { min: 0, max: 10, label: '$0-$10' },
            { min: 10, max: 25, label: '$10-$25' },
            { min: 25, max: 50, label: '$25-$50' },
            { min: 50, max: 100, label: '$50-$100' },
            { min: 100, max: Infinity, label: '$100+' }
        ];

        return ranges.map(range => ({
            ...range,
            count: menuItems.filter(item => item.price >= range.min && item.price < range.max).length,
            percentage: menuItems.length > 0 ? 
                (menuItems.filter(item => item.price >= range.min && item.price < range.max).length / menuItems.length) * 100 : 0
        }));
    }, [menuItems]);

    // Calculate special type distribution
    const specialTypeDistribution = useMemo(() => {
        const distribution = new Map<string, number>();
        menuItems.forEach(item => {
            const type = item.specialType || 'None';
            distribution.set(type, (distribution.get(type) || 0) + 1);
        });
        return Array.from(distribution.entries()).map(([type, count]) => ({
            type,
            count,
            percentage: (count / menuItems.length) * 100
        }));
    }, [menuItems]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                    <p className="text-gray-600">Monitor your menu performance and business metrics</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-lg ${metric.color} text-white`}>
                                {metric.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-sm ${
                                metric.trend === 'up' ? 'text-green-600' : 
                                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                                {metric.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                                {metric.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                                {metric.trend === 'neutral' && <Activity className="w-4 h-4" />}
                                <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
                            <p className="text-2xl font-bold text-gray-900">
                                {metric.label.includes('Price') || metric.label.includes('Value') 
                                    ? `$${metric.value.toFixed(2)}` 
                                    : metric.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Performance */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
                    <div className="space-y-4">
                        {categoryPerformance.slice(0, 8).map((category, index) => (
                            <div key={category.categoryId} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        index === 0 ? 'bg-yellow-500' :
                                        index === 1 ? 'bg-gray-400' :
                                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                    }`} />
                                    <span className="text-sm font-medium text-gray-700">
                                        {category.categoryName}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {category.itemCount} items
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        ${category.averagePrice.toFixed(2)} avg
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Distribution</h3>
                    <div className="space-y-3">
                        {priceDistribution.map((range, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{range.label}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: `${range.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                        {range.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Special Type Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Type Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {specialTypeDistribution.map((item, index) => (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                            <div className="text-sm text-gray-600">{item.type}</div>
                            <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <div className="text-left">
                            <div className="font-medium text-blue-900">Generate Report</div>
                            <div className="text-sm text-blue-700">Export detailed analytics</div>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        <div className="text-left">
                            <div className="font-medium text-green-900">Performance Review</div>
                            <div className="text-sm text-green-700">Analyze trends</div>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <Star className="w-6 h-6 text-purple-600" />
                        <div className="text-left">
                            <div className="font-medium text-purple-900">Menu Optimization</div>
                            <div className="text-sm text-purple-700">Get AI suggestions</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
