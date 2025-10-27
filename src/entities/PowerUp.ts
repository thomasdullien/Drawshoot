import { Entity } from './Entity';
import { Vector2D } from '../geometry/Vector2D';
import { EntityType, ICollisionComponent } from '../core/types';

/**
 * PowerUp entity (diamond sprite)
 */
export class PowerUp extends Entity implements ICollisionComponent {
  size: number;
  radius: number;
  fallSpeed: number;
  lifetime: number;
  maxLifetime: number;
  color: string;
  pulsePhase: number;

  constructor(position: Vector2D, size: number, fallSpeed: number, lifetime: number) {
    super(EntityType.POWERUP, position);
    this.size = size;
    this.radius = size * 0.7; // Approximate radius for collision
    this.fallSpeed = fallSpeed;
    this.lifetime = 0;
    this.maxLifetime = lifetime;
    this.color = '#00FFFF'; // Cyan
    this.pulsePhase = 0;

    // Initial velocity downward
    this.velocity = new Vector2D(0, fallSpeed);
  }

  /**
   * Update powerup position
   */
  update(deltaTime: number): void {
    this.lifetime += deltaTime * 1000;

    // Move downward
    this.position = this.position.add(this.velocity.multiply(deltaTime));

    // Rotate for visual effect
    this.rotation += Math.PI * deltaTime;

    // Pulse effect
    this.pulsePhase += deltaTime * 5;

    // Deactivate after lifetime
    if (this.lifetime > this.maxLifetime) {
      this.active = false;
    }
  }

  getBoundingBox(): { min: Vector2D; max: Vector2D } {
    return {
      min: new Vector2D(this.position.x - this.size, this.position.y - this.size),
      max: new Vector2D(this.position.x + this.size, this.position.y + this.size),
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Pulse effect
    const pulseFactor = 1 + Math.sin(this.pulsePhase) * 0.2;
    ctx.scale(pulseFactor, pulseFactor);

    // Draw diamond (rotated square)
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(this.size, 0);
    ctx.lineTo(0, this.size);
    ctx.lineTo(-this.size, 0);
    ctx.closePath();

    // Gradient fill
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, '#0088BB');

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner sparkle
    ctx.beginPath();
    ctx.moveTo(0, -this.size * 0.5);
    ctx.lineTo(this.size * 0.5, 0);
    ctx.lineTo(0, this.size * 0.5);
    ctx.lineTo(-this.size * 0.5, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    ctx.restore();

    // Debug: Draw collision circle
    // ctx.beginPath();
    // ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    // ctx.strokeStyle = '#00FFFF';
    // ctx.stroke();
  }
}
