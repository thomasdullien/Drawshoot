import { Entity } from './Entity';
import { Vector2D } from '../geometry/Vector2D';
import { EntityType, ICollisionComponent } from '../core/types';

/**
 * Player entity (triangular sprite)
 */
export class Player extends Entity implements ICollisionComponent {
  size: number;
  speed: number;
  targetPosition: Vector2D | null;
  maxEnergy: number;
  energy: number;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  lastShotTime: number;
  shootCooldown: number;
  energyDrainRate: number;
  energyRecoveryRate: number;

  // Collision
  radius: number;
  vertices: Vector2D[];

  // Visual
  color: string;
  isBroken: boolean; // When life is lost

  constructor(position: Vector2D, size: number, speed: number, config: {
    maxEnergy: number;
    shootCooldown: number;
    energyDrainRate: number;
    energyRecoveryRate: number;
  }) {
    super(EntityType.PLAYER, position);
    this.size = size;
    this.speed = speed;
    this.targetPosition = null;
    this.maxEnergy = config.maxEnergy;
    this.energy = config.maxEnergy;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.lastShotTime = 0;
    this.shootCooldown = config.shootCooldown;
    this.energyDrainRate = config.energyDrainRate;
    this.energyRecoveryRate = config.energyRecoveryRate;

    // Collision setup (triangle approximated as circle)
    this.radius = size * 0.6; // Approximate radius
    this.vertices = this.getTriangleVertices();

    this.color = '#00FFFF'; // Cyan
    this.isBroken = false;

    // Point upward
    this.rotation = -Math.PI / 2;
  }

  /**
   * Get vertices of the triangle in world space
   */
  private getTriangleVertices(): Vector2D[] {
    const height = this.size;
    const base = this.size * 0.8;

    // Triangle points relative to position
    const vertices = [
      new Vector2D(0, -height / 2), // Top
      new Vector2D(-base / 2, height / 2), // Bottom left
      new Vector2D(base / 2, height / 2), // Bottom right
    ];

    // Rotate and translate to world space
    return vertices.map((v) => {
      const rotated = v.rotate(this.rotation);
      return this.position.add(rotated);
    });
  }

  /**
   * Set target position for movement
   */
  setTarget(target: Vector2D | null): void {
    this.targetPosition = target;
  }

  /**
   * Move toward target position
   */
  update(deltaTime: number): void {
    // Update invulnerability
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= deltaTime;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    // Recover energy
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + this.energyRecoveryRate * deltaTime);
    }

    // Move toward target
    if (this.targetPosition) {
      const direction = this.targetPosition.subtract(this.position);
      const distance = direction.magnitude();

      if (distance > 1) {
        // Move at constant speed
        const movement = direction.normalize().multiply(this.speed * deltaTime);

        // Don't overshoot
        if (movement.magnitude() < distance) {
          this.position = this.position.add(movement);
        } else {
          this.position = this.targetPosition.clone();
        }
      }
    }

    // Update collision vertices
    this.vertices = this.getTriangleVertices();
  }

  /**
   * Drain energy when touching enemy
   */
  drainEnergy(deltaTime: number): void {
    if (this.isInvulnerable) return;

    this.energy = Math.max(0, this.energy - this.energyDrainRate * deltaTime);

    if (this.energy <= 0) {
      this.breakApart();
    }
  }

  /**
   * Check if can shoot
   */
  canShoot(currentTime: number): boolean {
    return currentTime - this.lastShotTime >= this.shootCooldown;
  }

  /**
   * Record shot time
   */
  recordShot(currentTime: number): void {
    this.lastShotTime = currentTime;
  }

  /**
   * Break apart (lose a life)
   */
  breakApart(): void {
    this.isBroken = true;
    this.active = false;
  }

  /**
   * Make invulnerable for a period
   */
  makeInvulnerable(duration: number): void {
    this.isInvulnerable = true;
    this.invulnerabilityTimer = duration;
  }

  /**
   * Reset energy to full
   */
  resetEnergy(): void {
    this.energy = this.maxEnergy;
  }

  getBoundingBox(): { min: Vector2D; max: Vector2D } {
    const vertices = this.getTriangleVertices();
    const xs = vertices.map((v) => v.x);
    const ys = vertices.map((v) => v.y);

    return {
      min: new Vector2D(Math.min(...xs), Math.min(...ys)),
      max: new Vector2D(Math.max(...xs), Math.max(...ys)),
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Flicker when invulnerable
    if (this.isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Draw triangle
    ctx.beginPath();
    ctx.moveTo(0, -this.size / 2);
    ctx.lineTo(-this.size * 0.4, this.size / 2);
    ctx.lineTo(this.size * 0.4, this.size / 2);
    ctx.closePath();

    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Debug: Draw collision circle
    // ctx.beginPath();
    // ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    // ctx.strokeStyle = '#FF0000';
    // ctx.stroke();
  }
}
