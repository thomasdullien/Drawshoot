import { CustomSpriteData, EnemyType } from '../core/types';

/**
 * Manages local storage for custom sprite data
 */
export class LocalStorageManager {
  private static readonly STORAGE_KEY = 'drawshoot_custom_sprites';

  /**
   * Save a custom sprite
   */
  static saveCustomSprite(type: EnemyType, imageData: string): void {
    const sprites = this.getAllCustomSprites();

    const spriteData: CustomSpriteData = {
      type,
      imageData,
      timestamp: Date.now(),
    };

    sprites[type] = spriteData;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sprites));
    } catch (error) {
      console.error('Failed to save custom sprite:', error);
    }
  }

  /**
   * Get a custom sprite by type
   */
  static getCustomSprite(type: EnemyType): CustomSpriteData | null {
    const sprites = this.getAllCustomSprites();
    return sprites[type] || null;
  }

  /**
   * Get all custom sprites
   */
  static getAllCustomSprites(): Record<number, CustomSpriteData> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return {};

      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load custom sprites:', error);
      return {};
    }
  }

  /**
   * Delete a custom sprite
   */
  static deleteCustomSprite(type: EnemyType): void {
    const sprites = this.getAllCustomSprites();
    delete sprites[type];

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sprites));
    } catch (error) {
      console.error('Failed to delete custom sprite:', error);
    }
  }

  /**
   * Clear all custom sprites
   */
  static clearAllCustomSprites(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear custom sprites:', error);
    }
  }

  /**
   * Check if a custom sprite exists for a type
   */
  static hasCustomSprite(type: EnemyType): boolean {
    return this.getCustomSprite(type) !== null;
  }

  /**
   * Create ImageBitmap from custom sprite data
   */
  static async loadCustomSpriteImage(type: EnemyType): Promise<ImageBitmap | null> {
    const spriteData = this.getCustomSprite(type);
    if (!spriteData) return null;

    try {
      // Convert base64 to blob
      const response = await fetch(spriteData.imageData);
      const blob = await response.blob();

      // Create ImageBitmap
      return await createImageBitmap(blob);
    } catch (error) {
      console.error('Failed to load custom sprite image:', error);
      return null;
    }
  }
}
