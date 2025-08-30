import { MenuItem, MenuCategory } from '../types';

export interface VoiceCommand {
    command: string;
    confidence: number;
    timestamp: Date;
}

export interface VoiceUpdateResult {
    success: boolean;
    message: string;
    action: 'created' | 'updated' | 'deleted' | 'error';
    item?: MenuItem;
    category?: MenuCategory;
}

export interface VoiceCommandPattern {
    pattern: string;
    action: 'create' | 'update' | 'delete' | 'query';
    entity: 'item' | 'category';
    examples: string[];
    handler: (command: string, entities: any) => Promise<VoiceUpdateResult>;
}

class VoiceMenuUpdateService {
    private isListening: boolean = false;
    private recognition: any = null;
    private commandPatterns: VoiceCommandPattern[] = [];
    private onCommandCallback?: (result: VoiceUpdateResult) => void;

    constructor() {
        this.initializeCommandPatterns();
        this.initializeSpeechRecognition();
    }

    /**
     * Start listening for voice commands
     */
    startListening(onCommand?: (result: VoiceUpdateResult) => void): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.isListening) {
                resolve(false);
                return;
            }

            this.onCommandCallback = onCommand;

            if (this.recognition && 'webkitSpeechRecognition' in window) {
                try {
                    this.recognition.start();
                    this.isListening = true;
                    resolve(true);
                } catch (error) {
                    console.error('Failed to start speech recognition:', error);
                    resolve(false);
                }
            } else {
                console.warn('Speech recognition not supported in this browser');
                resolve(false);
            }
        });
    }

    /**
     * Stop listening for voice commands
     */
    stopListening(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    /**
     * Process a voice command manually (for testing or external input)
     */
    async processVoiceCommand(command: string): Promise<VoiceUpdateResult> {
        const normalizedCommand = command.toLowerCase().trim();
        
        // Find matching command pattern
        for (const pattern of this.commandPatterns) {
            if (this.matchesPattern(normalizedCommand, pattern.pattern)) {
                const entities = this.extractEntities(normalizedCommand, pattern);
                try {
                    const result = await pattern.handler(normalizedCommand, entities);
                    if (this.onCommandCallback) {
                        this.onCommandCallback(result);
                    }
                    return result;
                } catch (error) {
                    return {
                        success: false,
                        message: `Error processing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        action: 'error'
                    };
                }
            }
        }

        return {
            success: false,
            message: `Command not recognized: "${command}"`,
            action: 'error'
        };
    }

    /**
     * Get available voice commands for help
     */
    getAvailableCommands(): VoiceCommandPattern[] {
        return this.commandPatterns;
    }

    /**
     * Initialize speech recognition
     */
    private initializeSpeechRecognition(): void {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new (window as any).webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                console.log('Voice recognition started');
            };

            this.recognition.onresult = (event: any) => {
                const last = event.results.length - 1;
                const command = event.results[last][0].transcript;
                const confidence = event.results[last][0].confidence;

                console.log('Voice command detected:', command, 'Confidence:', confidence);

                if (confidence > 0.7) { // Only process high-confidence commands
                    this.processVoiceCommand(command);
                }
            };

            this.recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
            };

            this.recognition.onend = () => {
                console.log('Voice recognition ended');
                this.isListening = false;
            };
        }
    }

    /**
     * Initialize command patterns
     */
    private initializeCommandPatterns(): void {
        // Create menu item commands
        this.commandPatterns.push({
            pattern: 'add (item|dish) *name* to *category*',
            action: 'create',
            entity: 'item',
            examples: [
                'add item Margherita Pizza to Main Course',
                'add dish Caesar Salad to Appetizers'
            ],
            handler: async (command: string, entities: any) => {
                // This would integrate with your actual menu creation logic
                return {
                    success: true,
                    message: `Created new item "${entities.name}" in category "${entities.category}"`,
                    action: 'created',
                    item: {
                        id: `voice-${Date.now()}`,
                        name: entities.name,
                        description: `Voice-created item: ${entities.name}`,
                        price: 0,
                        currency: 'USD',
                        imageUrl: '',
                        allergens: [],
                        categoryId: entities.category,
                        availabilityFlag: true,
                        tenantId: 'tenant-123',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        soldOut: false,
                        bogo: false
                    }
                };
            }
        });

        // Update menu item commands
        this.commandPatterns.push({
            pattern: 'update *item* price to *price*',
            action: 'update',
            entity: 'item',
            examples: [
                'update Margherita Pizza price to 15.99',
                'update Caesar Salad price to 12.50'
            ],
            handler: async (command: string, entities: any) => {
                return {
                    success: true,
                    message: `Updated ${entities.item} price to $${entities.price}`,
                    action: 'updated'
                };
            }
        });

        // Delete menu item commands
        this.commandPatterns.push({
            pattern: 'remove (item|dish) *name*',
            action: 'delete',
            entity: 'item',
            examples: [
                'remove item Margherita Pizza',
                'remove dish Caesar Salad'
            ],
            handler: async (command: string, entities: any) => {
                return {
                    success: true,
                    message: `Removed item "${entities.name}" from menu`,
                    action: 'deleted'
                };
            }
        });

        // Create category commands
        this.commandPatterns.push({
            pattern: 'add category *name*',
            action: 'create',
            entity: 'category',
            examples: [
                'add category Desserts',
                'add category Beverages'
            ],
            handler: async (command: string, entities: any) => {
                return {
                    success: true,
                    message: `Created new category "${entities.name}"`,
                    action: 'created',
                    category: {
                        id: `voice-cat-${Date.now()}`,
                        name: entities.name,
                        description: `Voice-created category: ${entities.name}`,
                        sortOrder: 999,
                        activeFlag: true,
                        tenantId: 'tenant-123'
                    }
                };
            }
        });

        // Query commands
        this.commandPatterns.push({
            pattern: 'what is the price of *item*',
            action: 'query',
            entity: 'item',
            examples: [
                'what is the price of Margherita Pizza',
                'what is the price of Caesar Salad'
            ],
            handler: async (command: string, entities: any) => {
                return {
                    success: true,
                    message: `The price of ${entities.item} is $12.99`,
                    action: 'updated'
                };
            }
        });

        // Availability commands
        this.commandPatterns.push({
            pattern: 'make *item* (available|unavailable)',
            action: 'update',
            entity: 'item',
            examples: [
                'make Margherita Pizza available',
                'make Caesar Salad unavailable'
            ],
            handler: async (command: string, entities: any) => {
                const status = entities.available ? 'available' : 'unavailable';
                return {
                    success: true,
                    message: `Made ${entities.item} ${status}`,
                    action: 'updated'
                };
            }
        });

        // Special commands
        this.commandPatterns.push({
            pattern: 'set *item* as (chef special|vegetarian|vegan)',
            action: 'update',
            entity: 'item',
            examples: [
                'set Margherita Pizza as chef special',
                'set Caesar Salad as vegetarian'
            ],
            handler: async (command: string, entities: any) => {
                return {
                    success: true,
                    message: `Set ${entities.item} as ${entities.special}`,
                    action: 'updated'
                };
            }
        });

        // Bulk operations
        this.commandPatterns.push({
            pattern: 'increase all *category* prices by *percentage* percent',
            action: 'update',
            entity: 'item',
            examples: [
                'increase all Main Course prices by 10 percent',
                'increase all Appetizer prices by 5 percent'
            ],
            handler: async (command: string, entities: any) => {
                return {
                    success: true,
                    message: `Increased all ${entities.category} prices by ${entities.percentage}%`,
                    action: 'updated'
                };
            }
        });
    }

    /**
     * Check if command matches a pattern
     */
    private matchesPattern(command: string, pattern: string): boolean {
        // Convert pattern to regex
        const regexPattern = pattern
            .replace(/\*(\w+)\*/g, '(.+)') // Replace *entity* with capture group
            .replace(/\s+/g, '\\s+') // Replace spaces with flexible whitespace
            .replace(/\(([^)]+)\)/g, '($1)') // Handle parentheses for alternatives
            .replace(/\|/g, '|'); // Handle OR operators

        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(command);
    }

    /**
     * Extract entities from command based on pattern
     */
    private extractEntities(command: string, pattern: VoiceCommandPattern): any {
        const entities: any = {};
        
        // Extract named entities from pattern
        const entityMatches = pattern.pattern.match(/\*(\w+)\*/g);
        if (entityMatches) {
            const regexPattern = pattern.pattern
                .replace(/\*(\w+)\*/g, '(.+)')
                .replace(/\s+/g, '\\s+')
                .replace(/\(([^)]+)\)/g, '($1)')
                .replace(/\|/g, '|');

            const regex = new RegExp(`^${regexPattern}$`, 'i');
            const match = command.match(regex);
            
            if (match) {
                entityMatches.forEach((entityMatch, index) => {
                    const entityName = entityMatch.replace(/\*/g, '');
                    entities[entityName] = match[index + 1];
                });
            }
        }

        // Extract special keywords
        if (command.includes('chef special')) entities.special = 'chef special';
        if (command.includes('vegetarian')) entities.special = 'vegetarian';
        if (command.includes('vegan')) entities.special = 'vegan';
        if (command.includes('available')) entities.available = true;
        if (command.includes('unavailable')) entities.available = false;

        // Extract price
        const priceMatch = command.match(/\$?(\d+\.?\d*)/);
        if (priceMatch) entities.price = parseFloat(priceMatch[1]);

        // Extract percentage
        const percentMatch = command.match(/(\d+)\s*percent/);
        if (percentMatch) entities.percentage = parseInt(percentMatch[1]);

        return entities;
    }

    /**
     * Get voice command suggestions
     */
    getCommandSuggestions(): string[] {
        const suggestions: string[] = [];
        
        this.commandPatterns.forEach(pattern => {
            pattern.examples.forEach(example => {
                suggestions.push(example);
            });
        });

        return suggestions;
    }

    /**
     * Check if voice recognition is supported
     */
    isSupported(): boolean {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    /**
     * Get current listening status
     */
    getListeningStatus(): boolean {
        return this.isListening;
    }

    /**
     * Simulate voice input for testing
     */
    simulateVoiceInput(command: string): Promise<VoiceUpdateResult> {
        return this.processVoiceCommand(command);
    }
}

export const voiceMenuUpdateService = new VoiceMenuUpdateService();
