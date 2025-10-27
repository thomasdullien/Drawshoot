import { describe, it, expect } from 'vitest';
import { CollisionDetection } from '../../src/geometry/CollisionDetection';
import { Vector2D } from '../../src/geometry/Vector2D';

describe('CollisionDetection', () => {
  describe('circleCircle', () => {
    it('should detect collision between overlapping circles', () => {
      const pos1 = new Vector2D(0, 0);
      const pos2 = new Vector2D(5, 0);
      const result = CollisionDetection.circleCircle(pos1, 10, pos2, 10);
      expect(result).toBe(true);
    });

    it('should not detect collision between separate circles', () => {
      const pos1 = new Vector2D(0, 0);
      const pos2 = new Vector2D(30, 0);
      const result = CollisionDetection.circleCircle(pos1, 10, pos2, 10);
      expect(result).toBe(false);
    });

    it('should detect collision when circles touch', () => {
      const pos1 = new Vector2D(0, 0);
      const pos2 = new Vector2D(20, 0);
      const result = CollisionDetection.circleCircle(pos1, 10, pos2, 10);
      expect(result).toBe(false); // Just touching, not overlapping
    });
  });

  describe('pointInPolygon', () => {
    it('should detect point inside square', () => {
      const square = [
        new Vector2D(0, 0),
        new Vector2D(10, 0),
        new Vector2D(10, 10),
        new Vector2D(0, 10),
      ];
      const point = new Vector2D(5, 5);
      expect(CollisionDetection.pointInPolygon(point, square)).toBe(true);
    });

    it('should detect point outside square', () => {
      const square = [
        new Vector2D(0, 0),
        new Vector2D(10, 0),
        new Vector2D(10, 10),
        new Vector2D(0, 10),
      ];
      const point = new Vector2D(15, 15);
      expect(CollisionDetection.pointInPolygon(point, square)).toBe(false);
    });
  });

  describe('boundingBoxOverlap', () => {
    it('should detect overlapping bounding boxes', () => {
      const box1 = {
        min: new Vector2D(0, 0),
        max: new Vector2D(10, 10),
      };
      const box2 = {
        min: new Vector2D(5, 5),
        max: new Vector2D(15, 15),
      };
      expect(CollisionDetection.boundingBoxOverlap(box1, box2)).toBe(true);
    });

    it('should not detect separate bounding boxes', () => {
      const box1 = {
        min: new Vector2D(0, 0),
        max: new Vector2D(10, 10),
      };
      const box2 = {
        min: new Vector2D(20, 20),
        max: new Vector2D(30, 30),
      };
      expect(CollisionDetection.boundingBoxOverlap(box1, box2)).toBe(false);
    });
  });
});
