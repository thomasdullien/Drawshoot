import { PowerUp } from '../entities/PowerUp';
import { Vector2D } from '../geometry/Vector2D';

/**
 * Manages power-up spawning and bullet size upgrades
 */
export class PowerUpSystem {
  private canvasWidth: number;
  private canvasHeight: number;
  private powerUpSize: number;
  private fallSpeed: number;
  private lifetime: number;
  private currentBulletSizeMultiplier: number;
  private maxBulletSizeMultiplier: number;
  private sizeIncrement: number;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    config: {
      size: number;
      fallSpeed: number;
      lifetime: number;
      maxSizeMultiplier: number;
      sizeIncrement: number;
    }
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.powerUpSize = config.size;
    this.fallSpeed = config.fallSpeed;
    this.lifetime = config.lifetime;
    this.currentBulletSizeMultiplier = 1.0;
    this.maxBulletSizeMultiplier = config.maxSizeMultiplier;
    this.sizeIncrement = config.sizeIncrement;
  }

  /**
   * Spawn a power-up at a given position
   */
  spawnPowerUp(position: Vector2D): PowerUp {
    return new PowerUp(position, this.powerUpSize, this.fallSpeed, this.lifetime);
  }

  /**
   * Spawn a power-up at the center of the screen (when wave is cleared)
   */
  spawnPowerUpAtCenter(): PowerUp {
    const position = new Vector2D(this.canvasWidth / 2, this.canvasHeight * 0.3);
    return this.spawnPowerUp(position);
  }

  /**
   * Apply power-up effect (increase bullet size)
   */
  applyPowerUp(): boolean {
    if (this.currentBulletSizeMultiplier >= this.maxBulletSizeMultiplier) {
      return false; // Already at max
    }

    this.currentBulletSizeMultiplier = Math.min(
      this.maxBulletSizeMultiplier,
      this.currentBulletSizeMultiplier + this.sizeIncrement
    );

    return true;
  }

  /**
   * Get current bullet size multiplier (area multiplier)
   */
  getBulletSizeMultiplier(): number {
    return this.currentBulletSizeMultiplier;
  }

  /**
   * Check if at max bullet size
   */
  isAtMaxBulletSize(): boolean {
    return this.currentBulletSizeMultiplier >= this.maxBulletSizeMultiplier;
  }

  /**
   * Get progress toward max bullet size (0 to 1)
   */
  getBulletSizeProgress(): number {
    return (this.currentBulletSizeMultiplier - 1.0) / (this.maxBulletSizeMultiplier - 1.0);
  }

  /**
   * Reset bullet size to default
   */
  reset(): void {
    this.currentBulletSizeMultiplier = 1.0;
  }
}
