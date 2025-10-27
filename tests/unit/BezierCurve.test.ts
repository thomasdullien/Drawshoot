import { describe, it, expect } from 'vitest';
import { BezierCurve } from '../../src/geometry/BezierCurve';
import { Vector2D } from '../../src/geometry/Vector2D';

describe('BezierCurve', () => {
  it('should create a bezier curve with control points', () => {
    const points = [new Vector2D(0, 0), new Vector2D(50, 100), new Vector2D(100, 0)];
    const curve = new BezierCurve(points, 1000);
    expect(curve.getDuration()).toBe(1000);
  });

  it('should return start point at t=0', () => {
    const points = [new Vector2D(0, 0), new Vector2D(50, 100), new Vector2D(100, 0)];
    const curve = new BezierCurve(points, 1000);
    const point = curve.getPointAt(0);
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);
  });

  it('should return end point at t=1', () => {
    const points = [new Vector2D(0, 0), new Vector2D(50, 100), new Vector2D(100, 0)];
    const curve = new BezierCurve(points, 1000);
    const point = curve.getPointAt(1);
    expect(point.x).toBe(100);
    expect(point.y).toBe(0);
  });

  it('should return midpoint at t=0.5 for linear curve', () => {
    const points = [new Vector2D(0, 0), new Vector2D(100, 0)];
    const curve = new BezierCurve(points, 1000);
    const point = curve.getPointAt(0.5);
    expect(point.x).toBeCloseTo(50, 1);
    expect(point.y).toBeCloseTo(0, 1);
  });

  it('should create random bezier curve', () => {
    const curve = BezierCurve.createRandom(4, 800, 1000, 5000);
    const controlPoints = curve.getControlPoints();
    expect(controlPoints.length).toBe(4);
  });

  it('should check if curve is complete', () => {
    const points = [new Vector2D(0, 0), new Vector2D(100, 0)];
    const curve = new BezierCurve(points, 1000);
    expect(curve.isComplete(500)).toBe(false);
    expect(curve.isComplete(1000)).toBe(true);
    expect(curve.isComplete(1500)).toBe(true);
  });
});
