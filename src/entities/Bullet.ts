import { Entity } from './Entity';
import { Vector2D } from '../geometry/Vector2D';
import { EntityType, ICollisionComponent } from '../core/types';

/**
 * Bullet entity (circular sprite)
 */
export class Bullet extends Entity implements ICollisionComponent {
  radius: number;
  baseRadius: number;
  speed: number;
  acceleration: number;
  color: string;
  lifetime: number;
  maxLifetime: number;

  constructor(
    position: Vector2D,
    radius: number,
    speed: number,
    acceleration: number
  ) {
    super(EntityType.BULLET, position);
    this.radius = radius;
    this.baseRadius = radius;
    this.speed = speed;
    this.acceleration = acceleration;
    this.color = '#FFFF00'; // Yellow
    this.lifetime = 0;
    this.maxLifetime = 5000; // 5 seconds max

    // Initial velocity upward
    this.velocity = new Vector2D(0, -speed);
  }

  /**
   * Update bullet position with linear acceleration
   */
  update(deltaTime: number): void {
    this.lifetime += deltaTime * 1000;

    // Apply acceleration (increase speed linearly)
    this.speed += this.acceleration * deltaTime;

    // Update velocity (always upward)
    this.velocity = new Vector2D(0, -this.speed);

    // Update position
    this.position = this.position.add(this.velocity.multiply(deltaTime));

    // Deactivate if lifetime exceeded
    if (this.lifetime > this.maxLifetime) {
      this.active = false;
    }
  }

  /**
   * Set size multiplier (from power-ups)
   */
  setAreaMultiplier(areaMultiplier: number): void {
    // Area = π * r^2, so r = sqrt(Area / π)
    // If we want area to be multiplied by areaMultiplier:
    // newArea = baseArea * areaMultiplier
    // newRadius = sqrt(newArea / π) = sqrt(baseArea * areaMultiplier / π)
    // newRadius = baseRadius * sqrt(areaMultiplier)
    this.radius = this.baseRadius * Math.sqrt(areaMultiplier);
  }

  getBoundingBox(): { min: Vector2D; max: Vector2D } {
    return {
      min: new Vector2D(this.position.x - this.radius, this.position.y - this.radius),
      max: new Vector2D(this.position.x + this.radius, this.position.y + this.radius),
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}
