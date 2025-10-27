import { describe, it, expect } from 'vitest';
import { Vector2D } from '../../src/geometry/Vector2D';

describe('Vector2D', () => {
  it('should create a vector with default values', () => {
    const v = new Vector2D();
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });

  it('should create a vector with specified values', () => {
    const v = new Vector2D(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
  });

  it('should add two vectors', () => {
    const v1 = new Vector2D(1, 2);
    const v2 = new Vector2D(3, 4);
    const result = v1.add(v2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  it('should subtract two vectors', () => {
    const v1 = new Vector2D(5, 7);
    const v2 = new Vector2D(2, 3);
    const result = v1.subtract(v2);
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });

  it('should multiply by scalar', () => {
    const v = new Vector2D(2, 3);
    const result = v.multiply(3);
    expect(result.x).toBe(6);
    expect(result.y).toBe(9);
  });

  it('should calculate magnitude', () => {
    const v = new Vector2D(3, 4);
    expect(v.magnitude()).toBe(5);
  });

  it('should normalize vector', () => {
    const v = new Vector2D(3, 4);
    const normalized = v.normalize();
    expect(normalized.magnitude()).toBeCloseTo(1, 5);
  });

  it('should calculate distance between vectors', () => {
    const v1 = new Vector2D(0, 0);
    const v2 = new Vector2D(3, 4);
    expect(v1.distanceTo(v2)).toBe(5);
  });

  it('should calculate dot product', () => {
    const v1 = new Vector2D(2, 3);
    const v2 = new Vector2D(4, 5);
    expect(v1.dot(v2)).toBe(23); // 2*4 + 3*5 = 8 + 15 = 23
  });
});
