import { Entity } from './Entity';
import { Vector2D } from '../geometry/Vector2D';
import { BezierCurve } from '../geometry/BezierCurve';
import { EntityType, EnemyType, ICollisionComponent } from '../core/types';

/**
 * Enemy entity (polygon sprite following Bezier curve)
 */
export class Enemy extends Entity implements ICollisionComponent {
  enemyType: EnemyType;
  size: number;
  curve: BezierCurve;
  curveTime: number;
  color: string;
  customImage: ImageBitmap | null;

  // Collision
  radius: number;
  vertices: Vector2D[];

  constructor(
    enemyType: EnemyType,
    size: number,
    curve: BezierCurve,
    customImage: ImageBitmap | null = null
  ) {
    super(EntityType.ENEMY, curve.getPointAt(0));
    this.enemyType = enemyType;
    this.size = size;
    this.curve = curve;
    this.curveTime = 0;
    this.customImage = customImage;

    // Different colors for different enemy types
    const colors = {
      [EnemyType.SQUARE]: '#FF0000', // Red
      [EnemyType.PENTAGON]: '#FF8800', // Orange
      [EnemyType.HEXAGON]: '#FFFF00', // Yellow
      [EnemyType.HEPTAGON]: '#00FF00', // Green
      [EnemyType.OCTAGON]: '#FF00FF', // Magenta
    };
    this.color = colors[enemyType];

    // Collision setup
    this.radius = size * 0.7; // Approximate radius
    this.vertices = this.getPolygonVertices();
  }

  /**
   * Get vertices of the polygon in world space
   */
  private getPolygonVertices(): Vector2D[] {
    const sides = this.enemyType;
    const vertices: Vector2D[] = [];

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + this.rotation;
      const x = Math.cos(angle) * this.size;
      const y = Math.sin(angle) * this.size;
      vertices.push(this.position.add(new Vector2D(x, y)));
    }

    return vertices;
  }

  /**
   * Update enemy position along Bezier curve
   */
  update(deltaTime: number): void {
    // Move along curve
    this.curveTime += deltaTime * 1000; // Convert to milliseconds

    if (this.curve.isComplete(this.curveTime)) {
      this.active = false;
      return;
    }

    // Update position from curve
    this.position = this.curve.getPointAtTime(this.curveTime);

    // Rotate slowly for visual effect
    this.rotation += Math.PI * 0.5 * deltaTime;

    // Update collision vertices
    this.vertices = this.getPolygonVertices();
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

    // Draw custom image or default polygon
    if (this.customImage) {
      ctx.drawImage(
        this.customImage,
        -this.size,
        -this.size,
        this.size * 2,
        this.size * 2
      );
    } else {
      // Draw polygon
      const sides = this.enemyType;
      ctx.beginPath();

      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle) * this.size;
        const y = Math.sin(angle) * this.size;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    // Debug: Draw collision circle
    // ctx.beginPath();
    // ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    // ctx.strokeStyle = '#00FF00';
    // ctx.stroke();
  }

  /**
   * Draw the Bezier curve path (for debugging)
   */
  renderPath(ctx: CanvasRenderingContext2D): void {
    const points = this.curve.getPathPoints(30);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    ctx.restore();
  }
}
