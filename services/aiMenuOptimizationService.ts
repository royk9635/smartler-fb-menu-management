import { MenuItem, MenuCategory } from '../types';

export interface SalesData {
    itemId: string;
    itemName: string;
    salesCount: number;
    revenue: number;
    date: string;
    categoryId: string;
}

export interface MenuOptimizationSuggestion {
    type: 'add' | 'remove' | 'modify' | 'reprice' | 'reposition';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: {
        revenue: number;
        popularity: number;
        efficiency: number;
    };
    action: string;
    reasoning: string;
}

export interface DemandForecast {
    itemId: string;
    itemName: string;
    currentDemand: number;
    predictedDemand: number;
    confidence: number;
    seasonality: 'high' | 'medium' | 'low';
    trend: 'increasing' | 'stable' | 'decreasing';
    recommendedInventory: number;
}

export interface InventoryOptimization {
    itemId: string;
    itemName: string;
    currentStock: number;
    recommendedStock: number;
    reorderPoint: number;
    reorderQuantity: number;
    holdingCost: number;
    stockoutRisk: 'high' | 'medium' | 'low';
}

class AIMenuOptimizationService {
    /**
     * Analyze menu performance and generate optimization suggestions
     */
    async analyzeMenuPerformance(
        menuItems: MenuItem[],
        categories: MenuCategory[],
        salesData: SalesData[]
    ): Promise<MenuOptimizationSuggestion[]> {
        const suggestions: MenuOptimizationSuggestion[] = [];
        
        // Analyze sales performance
        const salesAnalysis = this.analyzeSalesData(salesData, menuItems);
        
        // Generate suggestions based on analysis
        suggestions.push(...this.generatePricingSuggestions(salesAnalysis, menuItems));
        suggestions.push(...this.generateMenuStructureSuggestions(salesAnalysis, categories));
        suggestions.push(...this.generateItemOptimizationSuggestions(salesAnalysis, menuItems));
        suggestions.push(...this.generateSeasonalSuggestions(salesData, menuItems));
        
        // Sort by priority and impact
        return suggestions.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return b.impact.revenue - a.impact.revenue;
        });
    }

    /**
     * Forecast demand for menu items
     */
    async forecastDemand(
        menuItems: MenuItem[],
        salesData: SalesData[],
        forecastDays: number = 30
    ): Promise<DemandForecast[]> {
        const forecasts: DemandForecast[] = [];
        
        for (const item of menuItems) {
            const itemSales = salesData.filter(sale => sale.itemId === item.id);
            const forecast = this.calculateItemDemand(item, itemSales, forecastDays);
            forecasts.push(forecast);
        }
        
        return forecasts;
    }

    /**
     * Optimize inventory levels
     */
    async optimizeInventory(
        menuItems: MenuItem[],
        demandForecasts: DemandForecast[],
        currentInventory: Record<string, number>
    ): Promise<InventoryOptimization[]> {
        const optimizations: InventoryOptimization[] = [];
        
        for (const item of menuItems) {
            const forecast = demandForecasts.find(f => f.itemId === item.id);
            if (forecast) {
                const optimization = this.calculateInventoryOptimization(item, forecast, currentInventory[item.id] || 0);
                optimizations.push(optimization);
            }
        }
        
        return optimizations;
    }

    /**
     * Generate AI-powered menu recommendations
     */
    async generateMenuRecommendations(
        menuItems: MenuItem[],
        categories: MenuCategory[],
        salesData: SalesData[]
    ): Promise<{
        topPerformers: MenuItem[];
        underperformers: MenuItem[];
        recommendedAdditions: any[];
        categoryInsights: any[];
    }> {
        const salesAnalysis = this.analyzeSalesData(salesData, menuItems);
        
        // Identify top performers
        const topPerformers = this.identifyTopPerformers(salesAnalysis, menuItems);
        
        // Identify underperformers
        const underperformers = this.identifyUnderperformers(salesAnalysis, menuItems);
        
        // Generate recommended additions based on market trends
        const recommendedAdditions = this.generateRecommendedAdditions(salesAnalysis, categories);
        
        // Analyze category performance
        const categoryInsights = this.analyzeCategoryPerformance(salesAnalysis, categories);
        
        return {
            topPerformers,
            underperformers,
            recommendedAdditions,
            categoryInsights
        };
    }

    /**
     * Private methods for internal calculations
     */
    private analyzeSalesData(salesData: SalesData[], menuItems: MenuItem[]) {
        const analysis = new Map<string, {
            totalSales: number;
            totalRevenue: number;
            averageDailySales: number;
            salesTrend: number;
            popularity: number;
        }>();

        for (const item of menuItems) {
            const itemSales = salesData.filter(sale => sale.itemId === item.id);
            const totalSales = itemSales.reduce((sum, sale) => sum + sale.salesCount, 0);
            const totalRevenue = itemSales.reduce((sum, sale) => sum + sale.revenue, 0);
            
            // Calculate average daily sales
            const uniqueDays = new Set(itemSales.map(sale => sale.date.split('T')[0])).size;
            const averageDailySales = uniqueDays > 0 ? totalSales / uniqueDays : 0;
            
            // Calculate sales trend (simple linear regression)
            const salesTrend = this.calculateSalesTrend(itemSales);
            
            // Calculate popularity score
            const popularity = this.calculatePopularityScore(totalSales, averageDailySales, salesTrend);
            
            analysis.set(item.id, {
                totalSales,
                totalRevenue,
                averageDailySales,
                salesTrend,
                popularity
            });
        }
        
        return analysis;
    }

    private generatePricingSuggestions(salesAnalysis: Map<string, any>, menuItems: MenuItem[]): MenuOptimizationSuggestion[] {
        const suggestions: MenuOptimizationSuggestion[] = [];
        
        for (const item of menuItems) {
            const analysis = salesAnalysis.get(item.id);
            if (!analysis) continue;
            
            // High-performing items: suggest price increase
            if (analysis.popularity > 0.8 && analysis.salesTrend > 0.1) {
                const suggestedPrice = item.price * 1.1; // 10% increase
                suggestions.push({
                    type: 'reprice',
                    priority: 'medium',
                    title: `Increase price for ${item.name}`,
                    description: `This item is performing exceptionally well and can sustain a price increase.`,
                    impact: {
                        revenue: suggestedPrice * analysis.averageDailySales - item.price * analysis.averageDailySales,
                        popularity: 0.1,
                        efficiency: 0.2
                    },
                    action: `Consider increasing price from $${item.price} to $${suggestedPrice.toFixed(2)}`,
                    reasoning: `High popularity (${(analysis.popularity * 100).toFixed(1)}%) and positive sales trend suggest price elasticity.`
                });
            }
            
            // Underperforming items: suggest price decrease
            if (analysis.popularity < 0.3 && analysis.salesTrend < -0.1) {
                const suggestedPrice = item.price * 0.9; // 10% decrease
                suggestions.push({
                    type: 'reprice',
                    priority: 'high',
                    title: `Reduce price for ${item.name}`,
                    description: `This item is underperforming and may benefit from a price reduction.`,
                    impact: {
                        revenue: suggestedPrice * analysis.averageDailySales - item.price * analysis.averageDailySales,
                        popularity: 0.3,
                        efficiency: 0.4
                    },
                    action: `Consider reducing price from $${item.price} to $${suggestedPrice.toFixed(2)}`,
                    reasoning: `Low popularity (${(analysis.popularity * 100).toFixed(1)}%) and declining sales suggest price sensitivity.`
                });
            }
        }
        
        return suggestions;
    }

    private generateMenuStructureSuggestions(salesAnalysis: Map<string, any>, categories: MenuCategory[]): MenuOptimizationSuggestion[] {
        const suggestions: MenuOptimizationSuggestion[] = [];
        
        // Analyze category performance
        const categoryPerformance = new Map<string, { totalSales: number; totalRevenue: number; itemCount: number }>();
        
        for (const category of categories) {
            const categoryItems = Array.from(salesAnalysis.entries())
                .filter(([itemId, analysis]) => {
                    // This would need to be enhanced with actual category mapping
                    return true; // Placeholder logic
                });
            
            const totalSales = categoryItems.reduce((sum, [_, analysis]) => sum + analysis.totalSales, 0);
            const totalRevenue = categoryItems.reduce((sum, [_, analysis]) => sum + analysis.totalRevenue, 0);
            
            categoryPerformance.set(category.id, {
                totalSales,
                totalRevenue,
                itemCount: categoryItems.length
            });
        }
        
        // Suggest category restructuring
        for (const [categoryId, performance] of categoryPerformance) {
            if (performance.itemCount > 10 && performance.totalSales / performance.itemCount < 5) {
                suggestions.push({
                    type: 'modify',
                    priority: 'medium',
                    title: `Optimize ${categories.find(c => c.id === categoryId)?.name} category`,
                    description: `This category has too many items with low individual performance.`,
                    impact: {
                        revenue: performance.totalRevenue * 0.15,
                        popularity: 0.2,
                        efficiency: 0.4
                    },
                    action: `Consider reducing category size from ${performance.itemCount} to ${Math.ceil(performance.itemCount * 0.7)} items`,
                    reasoning: `Category has ${performance.itemCount} items with average daily sales of ${(performance.totalSales / performance.itemCount).toFixed(1)}.`
                });
            }
        }
        
        return suggestions;
    }

    private generateItemOptimizationSuggestions(salesAnalysis: Map<string, any>, menuItems: MenuItem[]): MenuOptimizationSuggestion[] {
        const suggestions: MenuOptimizationSuggestion[] = [];
        
        for (const item of menuItems) {
            const analysis = salesAnalysis.get(item.id);
            if (!analysis) continue;
            
            // Suggest removing consistently underperforming items
            if (analysis.popularity < 0.2 && analysis.salesTrend < -0.2) {
                suggestions.push({
                    type: 'remove',
                    priority: 'high',
                    title: `Consider removing ${item.name}`,
                    description: `This item consistently underperforms and may be costing more than it generates.`,
                    impact: {
                        revenue: -analysis.totalRevenue * 0.1, // Small revenue loss
                        popularity: 0.1,
                        efficiency: 0.6
                    },
                    action: `Evaluate removing this item from the menu`,
                    reasoning: `Very low popularity (${(analysis.popularity * 100).toFixed(1)}%) and strong declining trend.`
                });
            }
            
            // Suggest repositioning popular items
            if (analysis.popularity > 0.7 && analysis.salesTrend > 0.05) {
                suggestions.push({
                    type: 'reposition',
                    priority: 'medium',
                    title: `Promote ${item.name}`,
                    description: `This item is popular and trending upward - consider featuring it prominently.`,
                    impact: {
                        revenue: analysis.totalRevenue * 0.1,
                        popularity: 0.2,
                        efficiency: 0.3
                    },
                    action: `Move this item to a more prominent position in the menu`,
                    reasoning: `High popularity (${(analysis.popularity * 100).toFixed(1)}%) with positive growth trend.`
                });
            }
        }
        
        return suggestions;
    }

    private generateSeasonalSuggestions(salesData: SalesData[], menuItems: MenuItem[]): MenuOptimizationSuggestion[] {
        const suggestions: MenuOptimizationSuggestion[] = [];
        
        // Analyze seasonal patterns (simplified)
        const monthlySales = new Map<string, Map<number, number>>();
        
        for (const sale of salesData) {
            const month = new Date(sale.date).getMonth();
            if (!monthlySales.has(sale.itemId)) {
                monthlySales.set(sale.itemId, new Map());
            }
            const itemMonthly = monthlySales.get(sale.itemId)!;
            itemMonthly.set(month, (itemMonthly.get(month) || 0) + sale.salesCount);
        }
        
        // Identify seasonal items
        for (const [itemId, monthlyData] of monthlySales) {
            const item = menuItems.find(m => m.id === itemId);
            if (!item) continue;
            
            const currentMonth = new Date().getMonth();
            const currentMonthSales = monthlyData.get(currentMonth) || 0;
            const avgMonthlySales = Array.from(monthlyData.values()).reduce((sum, sales) => sum + sales, 0) / monthlyData.size;
            
            if (currentMonthSales > avgMonthlySales * 1.5) {
                suggestions.push({
                    type: 'modify',
                    priority: 'medium',
                    title: `Seasonal promotion for ${item.name}`,
                    description: `This item shows strong seasonal performance and could benefit from promotion.`,
                    impact: {
                        revenue: avgMonthlySales * item.price * 0.2,
                        popularity: 0.3,
                        efficiency: 0.2
                    },
                    action: `Consider seasonal promotion or menu highlighting`,
                    reasoning: `Current month sales (${currentMonthSales}) are ${((currentMonthSales / avgMonthlySales - 1) * 100).toFixed(1)}% above average.`
                });
            }
        }
        
        return suggestions;
    }

    private calculateSalesTrend(salesData: SalesData[]): number {
        if (salesData.length < 2) return 0;
        
        // Simple linear trend calculation
        const sortedSales = salesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const firstHalf = sortedSales.slice(0, Math.ceil(sortedSales.length / 2));
        const secondHalf = sortedSales.slice(Math.ceil(sortedSales.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, sale) => sum + sale.salesCount, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, sale) => sum + sale.salesCount, 0) / secondHalf.length;
        
        return (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
    }

    private calculatePopularityScore(totalSales: number, averageDailySales: number, salesTrend: number): number {
        // Normalize scores and combine them
        const salesScore = Math.min(totalSales / 100, 1); // Normalize to 0-1
        const dailyScore = Math.min(averageDailySales / 10, 1); // Normalize to 0-1
        const trendScore = Math.max(0, (salesTrend + 1) / 2); // Convert -1 to 1 range to 0-1
        
        return (salesScore * 0.4 + dailyScore * 0.4 + trendScore * 0.2);
    }

    private calculateItemDemand(item: MenuItem, salesData: SalesData[], forecastDays: number): DemandForecast {
        if (salesData.length === 0) {
            return {
                itemId: item.id,
                itemName: item.name,
                currentDemand: 0,
                predictedDemand: 0,
                confidence: 0.1,
                seasonality: 'low',
                trend: 'stable',
                recommendedInventory: 0
            };
        }
        
        // Calculate current demand (last 7 days average)
        const last7Days = salesData
            .filter(sale => new Date(sale.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .reduce((sum, sale) => sum + sale.salesCount, 0);
        const currentDemand = last7Days / 7;
        
        // Simple demand prediction (could be enhanced with ML models)
        const trend = this.calculateSalesTrend(salesData);
        const predictedDemand = currentDemand * (1 + trend * forecastDays / 30);
        
        // Calculate confidence based on data consistency
        const confidence = Math.min(salesData.length / 30, 1); // More data = higher confidence
        
        // Determine seasonality
        const seasonality = this.calculateSeasonality(salesData);
        
        // Determine trend direction
        const trendDirection: 'increasing' | 'stable' | 'decreasing' = 
            trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable';
        
        // Calculate recommended inventory
        const safetyStock = predictedDemand * 0.2; // 20% safety stock
        const recommendedInventory = Math.ceil(predictedDemand + safetyStock);
        
        return {
            itemId: item.id,
            itemName: item.name,
            currentDemand,
            predictedDemand,
            confidence,
            seasonality,
            trend: trendDirection,
            recommendedInventory
        };
    }

    private calculateSeasonality(salesData: SalesData[]): 'high' | 'medium' | 'low' {
        if (salesData.length < 30) return 'low';
        
        // Calculate variance in daily sales
        const dailySales = new Map<string, number>();
        for (const sale of salesData) {
            const date = sale.date.split('T')[0];
            dailySales.set(date, (dailySales.get(date) || 0) + sale.salesCount);
        }
        
        const salesValues = Array.from(dailySales.values());
        const mean = salesValues.reduce((sum, val) => sum + val, 0) / salesValues.length;
        const variance = salesValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / salesValues.length;
        const coefficientOfVariation = Math.sqrt(variance) / mean;
        
        if (coefficientOfVariation > 0.5) return 'high';
        if (coefficientOfVariation > 0.2) return 'medium';
        return 'low';
    }

    private calculateInventoryOptimization(
        item: MenuItem, 
        forecast: DemandForecast, 
        currentStock: number
    ): InventoryOptimization {
        const reorderPoint = Math.ceil(forecast.predictedDemand * 0.3); // 30% of predicted demand
        const reorderQuantity = Math.ceil(forecast.predictedDemand * 0.7); // 70% of predicted demand
        
        // Calculate stockout risk
        let stockoutRisk: 'high' | 'medium' | 'low' = 'low';
        if (currentStock < reorderPoint) {
            stockoutRisk = 'high';
        } else if (currentStock < reorderPoint * 1.5) {
            stockoutRisk = 'medium';
        }
        
        // Calculate holding cost (simplified)
        const holdingCost = currentStock * item.price * 0.02; // 2% monthly holding cost
        
        return {
            itemId: item.id,
            itemName: item.name,
            currentStock,
            recommendedStock: forecast.recommendedInventory,
            reorderPoint,
            reorderQuantity,
            holdingCost,
            stockoutRisk
        };
    }

    private identifyTopPerformers(salesAnalysis: Map<string, any>, menuItems: MenuItem[]): MenuItem[] {
        const performers = Array.from(salesAnalysis.entries())
            .map(([itemId, analysis]) => ({
                item: menuItems.find(m => m.id === itemId)!,
                score: analysis.popularity * 0.6 + analysis.salesTrend * 0.4
            }))
            .filter(p => p.item)
            .sort((a, b) => b.score - a.score);
        
        return performers.slice(0, 5).map(p => p.item);
    }

    private identifyUnderperformers(salesAnalysis: Map<string, any>, menuItems: MenuItem[]): MenuItem[] {
        const performers = Array.from(salesAnalysis.entries())
            .map(([itemId, analysis]) => ({
                item: menuItems.find(m => m.id === itemId)!,
                score: analysis.popularity * 0.6 + analysis.salesTrend * 0.4
            }))
            .filter(p => p.item)
            .sort((a, b) => a.score - b.score);
        
        return performers.slice(0, 5).map(p => p.item);
    }

    private generateRecommendedAdditions(salesAnalysis: Map<string, any>, categories: MenuCategory[]): any[] {
        // This would integrate with external market data APIs
        // For now, return placeholder recommendations
        return [
            {
                name: 'Plant-Based Burger',
                category: 'Main Course',
                reasoning: 'High demand for plant-based options',
                estimatedRevenue: 1500,
                popularity: 0.8
            },
            {
                name: 'Korean Fried Chicken',
                category: 'Appetizers',
                reasoning: 'Trending cuisine with high profit margins',
                estimatedRevenue: 1200,
                popularity: 0.7
            }
        ];
    }

    private analyzeCategoryPerformance(salesAnalysis: Map<string, any>, categories: MenuCategory[]): any[] {
        // This would analyze category-level performance
        // For now, return placeholder insights
        return categories.map(category => ({
            categoryId: category.id,
            categoryName: category.name,
            performance: 'good',
            recommendations: 'Consider adding seasonal items'
        }));
    }
}

export const aiMenuOptimizationService = new AIMenuOptimizationService();
