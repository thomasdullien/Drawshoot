/**
 * 2D Vector class for position, velocity, and direction calculations
 */
export class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  /**
   * Add two vectors
   */
  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  /**
   * Subtract two vectors
   */
  subtract(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  /**
   * Multiply vector by scalar
   */
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  /**
   * Divide vector by scalar
   */
  divide(scalar: number): Vector2D {
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  /**
   * Get the magnitude (length) of the vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Get the squared magnitude (for performance when comparing distances)
   */
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalize the vector (make it unit length)
   */
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return this.divide(mag);
  }

  /**
   * Calculate distance to another vector
   */
  distanceTo(v: Vector2D): number {
    return this.subtract(v).magnitude();
  }

  /**
   * Calculate squared distance to another vector
   */
  distanceSquaredTo(v: Vector2D): number {
    return this.subtract(v).magnitudeSquared();
  }

  /**
   * Calculate dot product
   */
  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * Calculate cross product (z component in 2D)
   */
  cross(v: Vector2D): number {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * Create a copy of this vector
   */
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  /**
   * Set vector components
   */
  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Static method to create a vector from angle and magnitude
   */
  static fromAngle(angle: number, magnitude: number = 1): Vector2D {
    return new Vector2D(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  /**
   * Get angle of this vector
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Rotate vector by angle (in radians)
   */
  rotate(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2D(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  /**
   * Limit the magnitude of the vector
   */
  limit(max: number): Vector2D {
    const mag = this.magnitude();
    if (mag > max) {
      return this.normalize().multiply(max);
    }
    return this.clone();
  }

  /**
   * Linear interpolation between two vectors
   */
  lerp(v: Vector2D, t: number): Vector2D {
    return new Vector2D(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t);
  }

  /**
   * Check if two vectors are equal
   */
  equals(v: Vector2D, epsilon: number = 0.0001): boolean {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
  }

  toString(): string {
    return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }
}
