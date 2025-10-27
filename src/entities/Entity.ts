import { Vector2D } from '../geometry/Vector2D';
import { IEntity, EntityType } from '../core/types';

/**
 * Base entity class
 */
export abstract class Entity implements IEntity {
  id: string;
  type: EntityType;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  active: boolean;

  constructor(type: EntityType, position: Vector2D) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.type = type;
    this.position = position;
    this.velocity = new Vector2D();
    this.rotation = 0;
    this.active = true;
  }

  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;

  /**
   * Deactivate this entity
   */
  destroy(): void {
    this.active = false;
  }

  /**
   * Check if entity is out of bounds
   */
  isOutOfBounds(width: number, height: number, margin: number = 100): boolean {
    return (
      this.position.x < -margin ||
      this.position.x > width + margin ||
      this.position.y < -margin ||
      this.position.y > height + margin
    );
  }
}
