# Algorithm Quick Reference

This document provides ready-to-implement code snippets for the core algorithms in the game.

## Table of Contents

1. [Bezier Curves](#bezier-curves)
2. [Collision Detection](#collision-detection)
3. [Player Movement](#player-movement)
4. [Bullet Physics](#bullet-physics)
5. [Power-up Calculations](#power-up-calculations)
6. [Spatial Partitioning](#spatial-partitioning)

---

## Bezier Curves

### De Casteljau's Algorithm

Calculate a point on a Bezier curve at parameter t (0 to 1):

```typescript
function bezierPoint(t: number, points: Vector2[]): Vector2 {
  // Base case: single point
  if (points.length === 1) {
    return points[0];
  }

  // Recursive case: linear interpolation
  const newPoints: Vector2[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    newPoints.push({
      x: (1 - t) * points[i].x + t * points[i + 1].x,
      y: (1 - t) * points[i].y + t * points[i + 1].y,
    });
  }

  return bezierPoint(t, newPoints);
}
```

### Iterative Version (More Efficient)

```typescript
function bezierPointIterative(t: number, points: Vector2[]): Vector2 {
  let pts = [...points]; // Copy array

  // Reduce points until one remains
  while (pts.length > 1) {
    const newPts: Vector2[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      newPts.push({
        x: (1 - t) * pts[i].x + t * pts[i + 1].x,
        y: (1 - t) * pts[i].y + t * pts[i + 1].y,
      });
    }
    pts = newPts;
  }

  return pts[0];
}
```

### Tangent Vector (for rotation)

```typescript
function bezierTangent(t: number, points: Vector2[]): Vector2 {
  // Get two points very close together
  const epsilon = 0.001;
  const t1 = Math.max(0, t - epsilon);
  const t2 = Math.min(1, t + epsilon);

  const p1 = bezierPoint(t1, points);
  const p2 = bezierPoint(t2, points);

  // Direction vector
  return {
    x: p2.x - p1.x,
    y: p2.y - p1.y,
  };
}
```

### Control Point Generation

Generate n control points for an enemy path:

```typescript
function generateControlPoints(
  sides: number,
  canvasWidth: number,
  canvasHeight: number
): Vector2[] {
  const points: Vector2[] = [];

  // Start point (top of screen, random x)
  points.push({
    x: Math.random() * canvasWidth,
    y: -50,
  });

  // Middle points
  for (let i = 1; i < sides - 1; i++) {
    const progress = i / (sides - 1);
    const y = progress * canvasHeight;

    // Add horizontal variation (±30% of screen width)
    const variation = (Math.random() - 0.5) * canvasWidth * 0.6;
    const x = canvasWidth / 2 + variation;

    points.push({
      x: Math.max(50, Math.min(canvasWidth - 50, x)),
      y: y,
    });
  }

  // End point (bottom of screen, random x)
  points.push({
    x: Math.random() * canvasWidth,
    y: canvasHeight + 50,
  });

  return points;
}
```

---

## Collision Detection

### Circle-Circle Collision

```typescript
interface Circle {
  x: number;
  y: number;
  radius: number;
}

function circleCollision(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSum = a.radius + b.radius;

  return distanceSquared < radiusSum * radiusSum; // Avoid sqrt for performance
}
```

### Point-in-Polygon (Ray Casting)

```typescript
function pointInPolygon(point: Vector2, polygon: Vector2[]): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
```

### Separating Axis Theorem (SAT) for Polygon-Polygon

```typescript
interface Projection {
  min: number;
  max: number;
}

function projectPolygon(polygon: Vector2[], axis: Vector2): Projection {
  let min = Infinity;
  let max = -Infinity;

  for (const point of polygon) {
    const dotProduct = point.x * axis.x + point.y * axis.y;
    min = Math.min(min, dotProduct);
    max = Math.max(max, dotProduct);
  }

  return { min, max };
}

function getAxes(polygon: Vector2[]): Vector2[] {
  const axes: Vector2[] = [];

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];

    // Edge vector
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };

    // Perpendicular axis (normal)
    const normal = { x: -edge.y, y: edge.x };

    // Normalize
    const length = Math.sqrt(normal.x ** 2 + normal.y ** 2);
    axes.push({ x: normal.x / length, y: normal.y / length });
  }

  return axes;
}

function polygonCollision(poly1: Vector2[], poly2: Vector2[]): boolean {
  const axes = [...getAxes(poly1), ...getAxes(poly2)];

  for (const axis of axes) {
    const proj1 = projectPolygon(poly1, axis);
    const proj2 = projectPolygon(poly2, axis);

    // Check for separation
    if (proj1.max < proj2.min || proj2.max < proj1.min) {
      return false; // Separating axis found
    }
  }

  return true; // No separating axis = collision
}
```

### Circle-Polygon Collision

```typescript
function circlePolygonCollision(
  circle: Circle,
  polygon: Vector2[]
): boolean {
  // Check if circle center is inside polygon
  if (pointInPolygon({ x: circle.x, y: circle.y }, polygon)) {
    return true;
  }

  // Check if circle intersects any edge
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];

    if (circleLineSegmentCollision(circle, p1, p2)) {
      return true;
    }
  }

  return false;
}

function circleLineSegmentCollision(
  circle: Circle,
  lineStart: Vector2,
  lineEnd: Vector2
): boolean {
  // Vector from line start to circle center
  const dx = circle.x - lineStart.x;
  const dy = circle.y - lineStart.y;

  // Line vector
  const lx = lineEnd.x - lineStart.x;
  const ly = lineEnd.y - lineStart.y;

  // Project point onto line
  const lineLength = Math.sqrt(lx * lx + ly * ly);
  const t = Math.max(0, Math.min(1, (dx * lx + dy * ly) / (lineLength * lineLength)));

  // Closest point on line segment
  const closestX = lineStart.x + t * lx;
  const closestY = lineStart.y + t * ly;

  // Distance from circle to closest point
  const distX = circle.x - closestX;
  const distY = circle.y - closestY;
  const distance = Math.sqrt(distX * distX + distY * distY);

  return distance < circle.radius;
}
```

---

## Spatial Partitioning

### Grid-Based Collision Optimization

```typescript
class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, GameObject[]>;

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear(): void {
    this.grid.clear();
  }

  getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  insert(obj: GameObject): void {
    const key = this.getCellKey(obj.position.x, obj.position.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(obj);
  }

  getNearby(obj: GameObject, range: number = 1): GameObject[] {
    const cellX = Math.floor(obj.position.x / this.cellSize);
    const cellY = Math.floor(obj.position.y / this.cellSize);

    const nearby: GameObject[] = [];

    // Check surrounding cells
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const key = `${cellX + dx},${cellY + dy}`;
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key)!);
        }
      }
    }

    return nearby;
  }

  // Usage in collision detection
  checkCollisions(bullets: Bullet[], enemies: Enemy[]): void {
    this.clear();

    // Insert all enemies into grid
    enemies.forEach((enemy) => this.insert(enemy));

    // Check each bullet against nearby enemies only
    bullets.forEach((bullet) => {
      const nearbyEnemies = this.getNearby(bullet);

      for (const enemy of nearbyEnemies) {
        if (circleCollision(bullet, enemy)) {
          bullet.active = false;
          enemy.active = false;
          break;
        }
      }
    });
  }
}
```

---

## Player Movement

### Constant Velocity Movement to Target

```typescript
class Player {
  position: Vector2;
  targetPosition: Vector2 | null;
  moveSpeed: number = 300; // pixels per second
  velocity: Vector2;

  onTouch(x: number, y: number): void {
    this.targetPosition = { x, y };
    this.fire();
  }

  update(deltaTime: number): void {
    if (!this.targetPosition) {
      this.velocity = { x: 0, y: 0 };
      return;
    }

    // Vector to target
    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Arrived at target
    if (distance < 5) {
      this.targetPosition = null;
      this.velocity = { x: 0, y: 0 };
      return;
    }

    // Direction unit vector
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Set constant velocity
    this.velocity = {
      x: dirX * this.moveSpeed,
      y: dirY * this.moveSpeed,
    };

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }
}
```

---

## Bullet Physics

### Linearly Increasing Velocity

```typescript
class Bullet {
  position: Vector2;
  velocity: Vector2;
  initialSpeed: number = 400; // pixels/second
  acceleration: number = 200; // pixels/second^2
  currentSpeed: number;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.currentSpeed = this.initialSpeed;
    this.velocity = { x: 0, y: -this.currentSpeed };
  }

  update(deltaTime: number): void {
    // Increase speed
    this.currentSpeed += this.acceleration * deltaTime;

    // Update velocity (upward = negative y)
    this.velocity.y = -this.currentSpeed;

    // Update position
    this.position.y += this.velocity.y * deltaTime;

    // Deactivate if off-screen
    if (this.position.y < -50) {
      this.active = false;
    }
  }
}
```

---

## Power-up Calculations

### Bullet Size Scaling (Area-Based)

```typescript
class PowerUpSystem {
  private baseBulletRadius: number = 5; // Initial radius
  private baseBulletArea: number;
  private maxAreaMultiplier: number = 4.0;
  private areaIncreasePercent: number = 0.10; // 10%

  constructor() {
    this.baseBulletArea = Math.PI * this.baseBulletRadius ** 2;
  }

  collectDiamond(player: Player): void {
    // Current bullet area
    const currentArea = Math.PI * player.bulletRadius ** 2;

    // Increase by 10% of base area
    const increase = this.baseBulletArea * this.areaIncreasePercent;
    const newArea = currentArea + increase;

    // Cap at 4x base area
    const maxArea = this.baseBulletArea * this.maxAreaMultiplier;
    const finalArea = Math.min(newArea, maxArea);

    // Convert back to radius
    player.bulletRadius = Math.sqrt(finalArea / Math.PI);
  }

  // Calculate how many diamonds until max
  diamondsUntilMax(currentRadius: number): number {
    const currentArea = Math.PI * currentRadius ** 2;
    const maxArea = this.baseBulletArea * this.maxAreaMultiplier;
    const areaPerDiamond = this.baseBulletArea * this.areaIncreasePercent;

    return Math.ceil((maxArea - currentArea) / areaPerDiamond);
  }
}
```

**Visual Example:**

```
Base radius: 5px
Base area: 78.54 units

Diamond 1:
  Current area: 78.54
  Increase: 7.854 (10% of base)
  New area: 86.39
  New radius: 5.24px

Diamond 10:
  Current area: 157.08
  Increase: 7.854
  New area: 164.93
  New radius: 7.25px

Diamond 40 (at max):
  Current area: 314.16 (4x base)
  Increase: 0 (capped)
  New area: 314.16
  New radius: 10px (2x base radius)
```

---

## Polygon Generation

### Regular Polygon Points

```typescript
function generatePolygon(
  centerX: number,
  centerY: number,
  radius: number,
  sides: number
): Vector2[] {
  const points: Vector2[] = [];
  const angleStep = (Math.PI * 2) / sides;
  const startAngle = -Math.PI / 2; // Start at top

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + angleStep * i;
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  return points;
}
```

### Render Polygon

```typescript
function renderPolygon(
  ctx: CanvasRenderingContext2D,
  points: Vector2[],
  fillColor: string,
  strokeColor?: string
): void {
  if (points.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
```

---

## Object Pooling

### Generic Object Pool

```typescript
class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize: number = 50
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  acquire(): T {
    let obj = this.available.pop();
    if (!obj) {
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.reset(obj);
      this.inUse.delete(obj);
      this.available.push(obj);
    }
  }

  releaseAll(): void {
    this.inUse.forEach((obj) => {
      this.reset(obj);
      this.available.push(obj);
    });
    this.inUse.clear();
  }

  get activeCount(): number {
    return this.inUse.size;
  }

  get poolSize(): number {
    return this.available.length + this.inUse.size;
  }
}

// Usage
const bulletPool = new ObjectPool<Bullet>(
  () => new Bullet(0, 0, 5),
  (bullet) => {
    bullet.active = false;
    bullet.position = { x: 0, y: 0 };
    bullet.velocity = { x: 0, y: 0 };
    bullet.currentSpeed = bullet.initialSpeed;
  },
  100 // Initial pool size
);

// Acquire bullet
const bullet = bulletPool.acquire();
bullet.position = { x: playerX, y: playerY };
bullet.active = true;

// Later, release it
if (!bullet.active) {
  bulletPool.release(bullet);
}
```

---

## Fixed Time Step Game Loop

### Prevents physics from depending on frame rate

```typescript
class GameEngine {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedDeltaTime: number = 1 / 60; // 60 FPS
  private readonly maxFrameTime: number = 0.25; // 250ms max

  start(): void {
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(currentTime: number): void {
    // Calculate elapsed time
    let frameTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Prevent spiral of death
    if (frameTime > this.maxFrameTime) {
      frameTime = this.maxFrameTime;
    }

    this.accumulator += frameTime;

    // Fixed time step updates
    while (this.accumulator >= this.fixedDeltaTime) {
      this.update(this.fixedDeltaTime);
      this.accumulator -= this.fixedDeltaTime;
    }

    // Render with interpolation factor
    const alpha = this.accumulator / this.fixedDeltaTime;
    this.render(alpha);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number): void {
    // Update game logic
    this.player.update(deltaTime);
    this.enemies.forEach((e) => e.update(deltaTime));
    this.bullets.forEach((b) => b.update(deltaTime));
    this.checkCollisions();
  }

  private render(alpha: number): void {
    // Clear screen
    this.renderer.clear();

    // Render all entities (optionally with interpolation)
    this.renderer.render(this.player, alpha);
    this.enemies.forEach((e) => this.renderer.render(e, alpha));
    this.bullets.forEach((b) => this.renderer.render(b, alpha));
  }
}
```

---

## Performance Optimization Tips

### 1. Avoid Creating Objects in Update Loop

**Bad:**
```typescript
update(deltaTime: number): void {
  const direction = { x: dx, y: dy }; // New object every frame!
  this.velocity = normalize(direction);
}
```

**Good:**
```typescript
private tempVector: Vector2 = { x: 0, y: 0 }; // Reuse

update(deltaTime: number): void {
  this.tempVector.x = dx;
  this.tempVector.y = dy;
  normalize(this.tempVector, this.velocity);
}
```

### 2. Use Squared Distance When Possible

**Bad:**
```typescript
const distance = Math.sqrt(dx * dx + dy * dy);
if (distance < threshold) { ... }
```

**Good:**
```typescript
const distanceSquared = dx * dx + dy * dy;
if (distanceSquared < threshold * threshold) { ... }
```

### 3. Early Exit from Loops

```typescript
// Check simple conditions first
if (!bullet.active || !enemy.active) continue;

// Then do expensive checks
if (circleCollision(bullet, enemy)) {
  // Handle collision
}
```

### 4. Cache Canvas Dimensions

```typescript
// Bad: Reading from DOM every frame
update(): void {
  if (this.x > canvas.width) { ... }
}

// Good: Cache the value
constructor() {
  this.canvasWidth = canvas.width;
  this.canvasHeight = canvas.height;
}
```

---

## Testing Utilities

### Mock Canvas for Unit Tests

```typescript
export function createMockCanvas(
  width: number = 800,
  height: number = 600
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function createMockContext(): CanvasRenderingContext2D {
  return createMockCanvas().getContext('2d')!;
}
```

### Mock Touch Event

```typescript
export function createTouchEvent(
  x: number,
  y: number,
  type: 'start' | 'move' | 'end' = 'start'
): TouchEvent {
  const touch = {
    identifier: 0,
    target: null,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 1,
  };

  return new TouchEvent(`touch${type}`, {
    touches: type === 'end' ? [] : [touch as Touch],
    targetTouches: [],
    changedTouches: [touch as Touch],
    bubbles: true,
    cancelable: true,
  });
}
```

---

## Summary of Key Formulas

### Distance
```
distance = sqrt((x2 - x1)² + (y2 - y1)²)
```

### Normalization
```
length = sqrt(x² + y²)
normalized.x = x / length
normalized.y = y / length
```

### Linear Interpolation
```
result = (1 - t) * start + t * end
where 0 <= t <= 1
```

### Circle Area
```
area = π * radius²
```

### Bullet Size Power-up
```
newArea = min(currentArea + 0.1 * baseArea, 4 * baseArea)
newRadius = sqrt(newArea / π)
```

### Angle from Vector
```
angle = atan2(y, x)
```

### Rotation Matrix
```
rotatedX = x * cos(angle) - y * sin(angle)
rotatedY = x * sin(angle) + y * cos(angle)
```

---

This reference should provide all the core algorithms you need to implement the game. Copy-paste and adapt as needed!
