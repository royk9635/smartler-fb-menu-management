import { MenuItem } from '../types';

export interface ARFoodModel {
    id: string;
    name: string;
    modelUrl: string;
    textureUrl?: string;
    scale: number;
    rotation: number;
    position: { x: number; y: number; z: number };
    animations?: string[];
    interactions?: ARInteraction[];
}

export interface ARInteraction {
    type: 'rotate' | 'scale' | 'move' | 'info' | 'customize';
    description: string;
    action: () => void;
}

export interface ARScene {
    id: string;
    name: string;
    background: string;
    lighting: ARLighting;
    models: ARFoodModel[];
    camera: ARCamera;
}

export interface ARLighting {
    ambient: { r: number; g: number; b: number; intensity: number };
    directional: { r: number; g: number; b: number; intensity: number; position: { x: number; y: number; z: number } };
    point: { r: number; g: number; b: number; intensity: number; position: { x: number; y: number; z: number } };
}

export interface ARCamera {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    fov: number;
    near: number;
    far: number;
}

export interface ARPreviewOptions {
    enableAR: boolean;
    enable3D: boolean;
    enableInteractions: boolean;
    quality: 'low' | 'medium' | 'high';
    platform: 'web' | 'mobile' | 'vr';
}

class ARMenuPreviewService {
    private isARSupported: boolean = false;
    private is3DSupported: boolean = false;
    private currentScene: ARScene | null = null;
    private renderer: any = null;
    private scene: any = null;
    private camera: any = null;
    private models: Map<string, any> = new Map();

    constructor() {
        this.checkSupport();
        this.initialize3D();
    }

    /**
     * Check AR and 3D support
     */
    private checkSupport(): void {
        // Check for WebXR support
        this.isARSupported = 'xr' in navigator && 'isSessionSupported' in navigator.xr;
        
        // Check for WebGL support
        const canvas = document.createElement('canvas');
        this.is3DSupported = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        
        console.log('AR Support:', this.isARSupported);
        console.log('3D Support:', this.is3DSupported);
    }

    /**
     * Initialize 3D rendering
     */
    private initialize3D(): void {
        if (!this.is3DSupported) return;

        try {
            // This would initialize Three.js or similar 3D library
            // For now, we'll create a placeholder
            this.scene = { type: 'three-scene' };
            this.camera = { type: 'three-camera' };
            this.renderer = { type: 'three-renderer' };
        } catch (error) {
            console.error('Failed to initialize 3D rendering:', error);
            this.is3DSupported = false;
        }
    }

    /**
     * Create AR preview for a menu item
     */
    async createARPreview(
        menuItem: MenuItem,
        options: ARPreviewOptions = {
            enableAR: false,
            enable3D: true,
            enableInteractions: true,
            quality: 'medium',
            platform: 'web'
        }
    ): Promise<ARScene> {
        const scene: ARScene = {
            id: `ar-scene-${menuItem.id}`,
            name: `AR Preview: ${menuItem.name}`,
            background: this.getBackgroundForCategory(menuItem.categoryId),
            lighting: this.getDefaultLighting(),
            models: [],
            camera: this.getDefaultCamera()
        };

        // Add food model
        const foodModel = await this.createFoodModel(menuItem, options);
        scene.models.push(foodModel);

        // Add complementary items if available
        if (menuItem.complimentary) {
            const complimentaryModel = await this.createComplimentaryModel(menuItem.complimentary);
            scene.models.push(complimentaryModel);
        }

        this.currentScene = scene;
        return scene;
    }

    /**
     * Start AR session
     */
    async startARSession(scene: ARScene): Promise<boolean> {
        if (!this.isARSupported) {
            console.warn('AR not supported in this browser');
            return false;
        }

        try {
            // This would start an actual AR session
            // For now, we'll simulate it
            console.log('Starting AR session for scene:', scene.name);
            
            // Simulate AR initialization
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return true;
        } catch (error) {
            console.error('Failed to start AR session:', error);
            return false;
        }
    }

    /**
     * Render 3D preview
     */
    async render3DPreview(scene: ARScene, container: HTMLElement): Promise<void> {
        if (!this.is3DSupported) {
            this.renderFallbackPreview(scene, container);
            return;
        }

        try {
            // This would render the actual 3D scene
            // For now, we'll create a placeholder
            const canvas = document.createElement('canvas');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            
            // Add 3D scene placeholder
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#1f2937';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('3D Preview', canvas.width / 2, canvas.height / 2);
                ctx.font = '16px Arial';
                ctx.fillText(scene.name, canvas.width / 2, canvas.height / 2 + 40);
            }
            
            container.appendChild(canvas);
            
        } catch (error) {
            console.error('Failed to render 3D preview:', error);
            this.renderFallbackPreview(scene, container);
        }
    }

    /**
     * Create food model for AR preview
     */
    private async createFoodModel(menuItem: MenuItem, options: ARPreviewOptions): Promise<ARFoodModel> {
        const model: ARFoodModel = {
            id: `model-${menuItem.id}`,
            name: menuItem.name,
            modelUrl: this.getModelUrlForItem(menuItem),
            textureUrl: menuItem.imageUrl || this.getDefaultTexture(menuItem),
            scale: this.getScaleForItem(menuItem),
            rotation: 0,
            position: { x: 0, y: 0, z: 0 },
            animations: this.getAnimationsForItem(menuItem),
            interactions: this.getInteractionsForItem(menuItem, options)
        };

        return model;
    }

    /**
     * Create complimentary model
     */
    private async createComplimentaryModel(itemName: string): Promise<ARFoodModel> {
        return {
            id: `complimentary-${Date.now()}`,
            name: itemName,
            modelUrl: this.getDefaultModelUrl(),
            scale: 0.8,
            rotation: 0,
            position: { x: 1, y: 0, z: 0 },
            animations: ['float'],
            interactions: [
                {
                    type: 'info',
                    description: 'View details',
                    action: () => console.log(`Viewing ${itemName} details`)
                }
            ]
        };
    }

    /**
     * Get model URL for menu item
     */
    private getModelUrlForItem(menuItem: MenuItem): string {
        // This would map to actual 3D model files
        // For now, return placeholder URLs
        const modelMap: Record<string, string> = {
            'pizza': '/models/pizza.glb',
            'burger': '/models/burger.glb',
            'salad': '/models/salad.glb',
            'pasta': '/models/pasta.glb',
            'dessert': '/models/dessert.glb',
            'beverage': '/models/beverage.glb'
        };

        const category = menuItem.categoryId.toLowerCase();
        for (const [key, url] of Object.entries(modelMap)) {
            if (category.includes(key) || menuItem.name.toLowerCase().includes(key)) {
                return url;
            }
        }

        return this.getDefaultModelUrl();
    }

    /**
     * Get default model URL
     */
    private getDefaultModelUrl(): string {
        return '/models/default-food.glb';
    }

    /**
     * Get default texture
     */
    private getDefaultTexture(menuItem: MenuItem): string {
        return menuItem.imageUrl || '/textures/default-food.jpg';
    }

    /**
     * Get scale for item
     */
    private getScaleForItem(menuItem: MenuItem): number {
        // Adjust scale based on item type
        if (menuItem.name.toLowerCase().includes('pizza')) return 1.2;
        if (menuItem.name.toLowerCase().includes('salad')) return 0.8;
        if (menuItem.name.toLowerCase().includes('dessert')) return 0.6;
        return 1.0;
    }

    /**
     * Get animations for item
     */
    private getAnimationsForItem(menuItem: MenuItem): string[] {
        const animations: string[] = ['idle'];
        
        // Add specific animations based on item type
        if (menuItem.name.toLowerCase().includes('pizza')) {
            animations.push('rotate', 'slice');
        }
        if (menuItem.name.toLowerCase().includes('salad')) {
            animations.push('toss', 'dress');
        }
        if (menuItem.name.toLowerCase().includes('dessert')) {
            animations.push('sprinkle', 'garnish');
        }
        
        return animations;
    }

    /**
     * Get interactions for item
     */
    private getInteractionsForItem(menuItem: MenuItem, options: ARPreviewOptions): ARInteraction[] {
        const interactions: ARInteraction[] = [];

        if (options.enableInteractions) {
            interactions.push(
                {
                    type: 'rotate',
                    description: 'Rotate item',
                    action: () => this.rotateModel(menuItem.id)
                },
                {
                    type: 'scale',
                    description: 'Resize item',
                    action: () => this.scaleModel(menuItem.id)
                },
                {
                    type: 'info',
                    description: 'View details',
                    action: () => this.showItemInfo(menuItem)
                }
            );

            // Add customization options
            if (menuItem.specialType) {
                interactions.push({
                    type: 'customize',
                    description: 'Customize options',
                    action: () => this.customizeItem(menuItem)
                });
            }
        }

        return interactions;
    }

    /**
     * Get background for category
     */
    private getBackgroundForCategory(categoryId: string): string {
        const backgrounds: Record<string, string> = {
            'main-course': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'appetizer': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'dessert': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'beverage': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        };

        return backgrounds[categoryId.toLowerCase()] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    /**
     * Get default lighting
     */
    private getDefaultLighting(): ARLighting {
        return {
            ambient: { r: 0.4, g: 0.4, b: 0.4, intensity: 0.6 },
            directional: { r: 1, g: 1, b: 1, intensity: 0.8, position: { x: 5, y: 5, z: 5 } },
            point: { r: 1, g: 0.9, b: 0.8, intensity: 0.5, position: { x: 0, y: 3, z: 0 } }
        };
    }

    /**
     * Get default camera
     */
    private getDefaultCamera(): ARCamera {
        return {
            position: { x: 0, y: 2, z: 5 },
            rotation: { x: -0.2, y: 0, z: 0 },
            fov: 75,
            near: 0.1,
            far: 1000
        };
    }

    /**
     * Render fallback preview
     */
    private renderFallbackPreview(scene: ARScene, container: HTMLElement): void {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.style.cssText = `
            width: 100%;
            height: 100%;
            background: ${scene.background};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            padding: 20px;
        `;

        fallbackDiv.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 20px;">🍽️ AR Preview</div>
            <div style="font-size: 18px; margin-bottom: 10px;">${scene.name}</div>
            <div style="font-size: 14px; opacity: 0.8;">3D preview not available</div>
            <div style="margin-top: 20px; padding: 10px 20px; background: rgba(255,255,255,0.2); border-radius: 8px;">
                <div style="font-size: 16px; margin-bottom: 10px;">Available Models:</div>
                ${scene.models.map(model => `<div style="margin: 5px 0;">• ${model.name}</div>`).join('')}
            </div>
        `;

        container.appendChild(fallbackDiv);
    }

    /**
     * Model interaction methods
     */
    private rotateModel(itemId: string): void {
        console.log(`Rotating model for item: ${itemId}`);
        // This would actually rotate the 3D model
    }

    private scaleModel(itemId: string): void {
        console.log(`Scaling model for item: ${itemId}`);
        // This would actually scale the 3D model
    }

    private showItemInfo(menuItem: MenuItem): void {
        console.log(`Showing info for: ${menuItem.name}`);
        // This would show item information overlay
    }

    private customizeItem(menuItem: MenuItem): void {
        console.log(`Customizing item: ${menuItem.name}`);
        // This would show customization options
    }

    /**
     * Check if AR is supported
     */
    isARSupported(): boolean {
        return this.isARSupported;
    }

    /**
     * Check if 3D is supported
     */
    is3DSupported(): boolean {
        return this.is3DSupported;
    }

    /**
     * Get current scene
     */
    getCurrentScene(): ARScene | null {
        return this.currentScene;
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        if (this.renderer) {
            // Clean up 3D renderer
            this.renderer = null;
        }
        this.currentScene = null;
        this.models.clear();
    }
}

export const arMenuPreviewService = new ARMenuPreviewService();
