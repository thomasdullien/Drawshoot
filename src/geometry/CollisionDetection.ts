import { Vector2D } from './Vector2D';
import { ICollisionComponent } from '../core/types';

/**
 * Collision detection utilities
 */
export class CollisionDetection {
  /**
   * Check collision between two circles
   */
  static circleCircle(
    pos1: Vector2D,
    radius1: number,
    pos2: Vector2D,
    radius2: number
  ): boolean {
    const distanceSquared = pos1.distanceSquaredTo(pos2);
    const radiusSum = radius1 + radius2;
    return distanceSquared < radiusSum * radiusSum;
  }

  /**
   * Check collision between circle and polygon using separating axis theorem
   */
  static circlePolygon(
    circlePos: Vector2D,
    circleRadius: number,
    polygonVertices: Vector2D[]
  ): boolean {
    // Find the closest point on the polygon to the circle center
    let closestDistance = Infinity;

    for (let i = 0; i < polygonVertices.length; i++) {
      const j = (i + 1) % polygonVertices.length;
      const edgeStart = polygonVertices[i];
      const edgeEnd = polygonVertices[j];

      if (edgeStart && edgeEnd) {
        const closestPoint = this.closestPointOnLineSegment(circlePos, edgeStart, edgeEnd);
        const distance = circlePos.distanceTo(closestPoint);

        if (distance < closestDistance) {
          closestDistance = distance;
        }
      }

    }

    // Also check if circle center is inside polygon
    if (this.pointInPolygon(circlePos, polygonVertices)) {
      return true;
    }

    return closestDistance < circleRadius;
  }

  /**
   * Check collision between two polygons using separating axis theorem (SAT)
   */
  static polygonPolygon(vertices1: Vector2D[], vertices2: Vector2D[]): boolean {
    const polygons = [vertices1, vertices2];

    for (const polygon of polygons) {
      for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;
        const pi = polygon[i];
        const pj = polygon[j];

        if (!pi || !pj) continue;

        // Get edge
        const edge = pj.subtract(pi);

        // Get perpendicular axis (normal)
        const axis = new Vector2D(-edge.y, edge.x).normalize();

        // Project both polygons onto the axis
        const proj1 = this.projectPolygon(vertices1, axis);
        const proj2 = this.projectPolygon(vertices2, axis);

        // Check for overlap
        if (proj1.max < proj2.min || proj2.max < proj1.min) {
          // Found separating axis, no collision
          return false;
        }
      }
    }

    // No separating axis found, polygons are colliding
    return true;
  }

  /**
   * Project polygon onto an axis
   */
  private static projectPolygon(
    vertices: Vector2D[],
    axis: Vector2D
  ): { min: number; max: number } {
    let min = Infinity;
    let max = -Infinity;

    for (const vertex of vertices) {
      const projection = vertex.dot(axis);
      min = Math.min(min, projection);
      max = Math.max(max, projection);
    }

    return { min, max };
  }

  /**
   * Find closest point on a line segment to a point
   */
  private static closestPointOnLineSegment(
    point: Vector2D,
    lineStart: Vector2D,
    lineEnd: Vector2D
  ): Vector2D {
    const line = lineEnd.subtract(lineStart);
    const lineLength = line.magnitudeSquared();

    if (lineLength === 0) return lineStart;

    const t = Math.max(
      0,
      Math.min(1, point.subtract(lineStart).dot(line) / lineLength)
    );

    return lineStart.add(line.multiply(t));
  }

  /**
   * Check if a point is inside a polygon using ray casting
   */
  static pointInPolygon(point: Vector2D, vertices: Vector2D[]): boolean {
    let inside = false;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const vi = vertices[i];
      const vj = vertices[j];

      if (!vi || !vj) continue;

      const xi = vi.x;
      const yi = vi.y;
      const xj = vj.x;
      const yj = vj.y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Generic collision detection between two entities with collision components
   */
  static checkCollision(
    entity1: ICollisionComponent,
    entity2: ICollisionComponent,
    pos1: Vector2D,
    pos2: Vector2D
  ): boolean {
    // Both have circles
    if (entity1.radius !== undefined && entity2.radius !== undefined) {
      return this.circleCircle(pos1, entity1.radius, pos2, entity2.radius);
    }

    // Entity1 is circle, entity2 is polygon
    if (entity1.radius !== undefined && entity2.vertices) {
      return this.circlePolygon(pos1, entity1.radius, entity2.vertices);
    }

    // Entity1 is polygon, entity2 is circle
    if (entity1.vertices && entity2.radius !== undefined) {
      return this.circlePolygon(pos2, entity2.radius, entity1.vertices);
    }

    // Both are polygons
    if (entity1.vertices && entity2.vertices) {
      return this.polygonPolygon(entity1.vertices, entity2.vertices);
    }

    return false;
  }

  /**
   * Broad phase collision detection using bounding boxes
   */
  static boundingBoxOverlap(
    box1: { min: Vector2D; max: Vector2D },
    box2: { min: Vector2D; max: Vector2D }
  ): boolean {
    return (
      box1.min.x < box2.max.x &&
      box1.max.x > box2.min.x &&
      box1.min.y < box2.max.y &&
      box1.max.y > box2.min.y
    );
  }
}
