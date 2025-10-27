import { Vector2D } from './Vector2D';

/**
 * Bezier curve implementation using De Casteljau's algorithm
 */
export class BezierCurve {
  private controlPoints: Vector2D[];
  private duration: number;

  constructor(controlPoints: Vector2D[], duration: number) {
    if (controlPoints.length < 2) {
      throw new Error('Bezier curve requires at least 2 control points');
    }
    this.controlPoints = controlPoints;
    this.duration = duration;
  }

  /**
   * Get point on the curve at parameter t (0 to 1)
   * Uses De Casteljau's algorithm for numerical stability
   */
  getPointAt(t: number): Vector2D {
    t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]

    // Special cases for endpoints
    const firstPoint = this.controlPoints[0];
    const lastPoint = this.controlPoints[this.controlPoints.length - 1];

    if (!firstPoint || !lastPoint) {
      throw new Error('Invalid control points');
    }

    if (t === 0) return firstPoint.clone();
    if (t === 1) return lastPoint.clone();

    // De Casteljau's algorithm
    const points = this.controlPoints.map((p) => p.clone());
    const n = points.length;

    for (let i = 1; i < n; i++) {
      for (let j = 0; j < n - i; j++) {
        const p1 = points[j];
        const p2 = points[j + 1];
        if (p1 && p2) {
          points[j] = p1.lerp(p2, t);
        }
      }
    }

    const result = points[0];
    if (!result) {
      throw new Error('Failed to calculate point on curve');
    }

    return result;
  }

  /**
   * Get point on the curve at a given time
   */
  getPointAtTime(time: number): Vector2D {
    const t = time / this.duration;
    return this.getPointAt(t);
  }

  /**
   * Get the tangent vector at parameter t
   */
  getTangentAt(t: number): Vector2D {
    const epsilon = 0.001;
    const t1 = Math.max(0, t - epsilon);
    const t2 = Math.min(1, t + epsilon);

    const p1 = this.getPointAt(t1);
    const p2 = this.getPointAt(t2);

    return p2.subtract(p1).normalize();
  }

  /**
   * Get the normal vector at parameter t (perpendicular to tangent)
   */
  getNormalAt(t: number): Vector2D {
    const tangent = this.getTangentAt(t);
    return new Vector2D(-tangent.y, tangent.x);
  }

  /**
   * Get total duration of the curve traversal
   */
  getDuration(): number {
    return this.duration;
  }

  /**
   * Check if a time value has completed the curve
   */
  isComplete(time: number): boolean {
    return time >= this.duration;
  }

  /**
   * Get all control points
   */
  getControlPoints(): Vector2D[] {
    return this.controlPoints.map((p) => p.clone());
  }

  /**
   * Generate evenly spaced points along the curve for rendering
   */
  getPathPoints(numPoints: number = 50): Vector2D[] {
    const points: Vector2D[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      points.push(this.getPointAt(t));
    }
    return points;
  }

  /**
   * Calculate approximate length of the curve
   */
  getLength(segments: number = 100): number {
    let length = 0;
    let prevPoint = this.getPointAt(0);

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const currentPoint = this.getPointAt(t);
      length += prevPoint.distanceTo(currentPoint);
      prevPoint = currentPoint;
    }

    return length;
  }

  /**
   * Static factory method to create a random Bezier curve
   * @param sides Number of control points (matching enemy type)
   * @param canvasWidth Width of the canvas
   * @param canvasHeight Height of the canvas
   * @param duration Duration of the curve traversal
   */
  static createRandom(
    sides: number,
    canvasWidth: number,
    canvasHeight: number,
    duration: number
  ): BezierCurve {
    const controlPoints: Vector2D[] = [];

    // First point at top of screen (spawn point)
    const startX = Math.random() * canvasWidth;
    controlPoints.push(new Vector2D(startX, 0));

    // Middle control points scattered across screen
    for (let i = 1; i < sides - 1; i++) {
      const x = Math.random() * canvasWidth;
      const y = (i / (sides - 1)) * canvasHeight;
      controlPoints.push(new Vector2D(x, y));
    }

    // Last point at bottom of screen (exit point)
    const endX = Math.random() * canvasWidth;
    controlPoints.push(new Vector2D(endX, canvasHeight));

    return new BezierCurve(controlPoints, duration);
  }

  /**
   * Static factory method to create a Bezier curve with better visual distribution
   */
  static createRandomEnhanced(
    sides: number,
    canvasWidth: number,
    canvasHeight: number,
    duration: number
  ): BezierCurve {
    const controlPoints: Vector2D[] = [];
    const margin = 50; // Keep points away from edges

    // First point at top of screen
    const startX = margin + Math.random() * (canvasWidth - 2 * margin);
    controlPoints.push(new Vector2D(startX, -margin));

    // Create control points that encourage interesting curves
    for (let i = 1; i < sides - 1; i++) {
      const progress = i / (sides - 1);

      // Add some horizontal oscillation
      const oscillation = Math.sin(progress * Math.PI * 2) * (canvasWidth * 0.3);
      const baseX = canvasWidth / 2 + oscillation;
      const x = Math.max(margin, Math.min(canvasWidth - margin, baseX + (Math.random() - 0.5) * canvasWidth * 0.3));

      const y = progress * (canvasHeight + margin);
      controlPoints.push(new Vector2D(x, y));
    }

    // Last point at bottom of screen
    const endX = margin + Math.random() * (canvasWidth - 2 * margin);
    controlPoints.push(new Vector2D(endX, canvasHeight + margin));

    return new BezierCurve(controlPoints, duration);
  }
}
