# Technical Plan: 2D Vertical Scrolling Shooter Game

## 1. High-Level Architecture

### 1.1 Core Architecture Pattern
**Entity-Component-System (ECS) Lite Pattern**
- Entities: Game objects (player, enemies, bullets, power-ups)
- Components: Data containers (position, velocity, sprite, health)
- Systems: Logic processors (movement, collision, rendering, input)

### 1.2 Module Organization

```
┌─────────────────────────────────────────────────────────┐
│                      Game Application                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Game Mode   │  │ Editor Mode  │  │  Menu Mode   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│                     Core Systems                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Renderer   │  │    Physics   │  │    Input     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Collision  │  │     Audio    │  │   Storage    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    Game Entities                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Player    │  │    Enemy     │  │    Bullet    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │   PowerUp    │  │     Wave     │                     │
│  └──────────────┘  └──────────────┘                     │
├─────────────────────────────────────────────────────────┤
│                    Utilities                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Geometry   │  │     Math     │  │    Config    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Core Classes and Responsibilities

#### **GameEngine** (Singleton)
- Manages game loop (requestAnimationFrame)
- Coordinates all systems
- Handles mode switching (game/editor/menu)
- Manages global state (score, lives, level)

#### **Renderer**
- Canvas 2D context management
- Sprite rendering (polygons, circles, custom painted sprites)
- Layer management (background, entities, UI, effects)
- Camera/viewport management
- Particle effects for explosions

#### **InputManager**
- Touch event handling (touchstart, touchmove, touchend)
- Mouse event fallback for desktop testing
- Touch point tracking and velocity calculation
- Event debouncing for performance

#### **PhysicsEngine**
- Position updates based on velocity
- Velocity calculations
- Bezier curve path following for enemies
- Acceleration for bullets

#### **CollisionDetector**
- Spatial partitioning (grid-based for optimization)
- Circle-circle collision (bullet-enemy)
- Circle-polygon collision (bullet-enemy with custom sprites)
- Polygon-polygon collision (player-enemy)
- Collision response (damage, destruction)

#### **WaveManager**
- Wave generation logic
- Enemy spawning patterns
- Difficulty progression
- Wave completion detection

#### **Entity Base Classes**

**GameObject** (Abstract)
- id: string
- position: Vector2
- velocity: Vector2
- rotation: number
- active: boolean
- update(deltaTime: number): void
- render(ctx: CanvasRenderingContext2D): void

**Player extends GameObject**
- health: number (energy)
- lives: number
- maxLives: number
- targetPosition: Vector2 | null
- moveSpeed: number
- bulletSize: number (1.0 to 4.0 multiplier)
- isBroken: boolean (visual state after hit)
- fire(): void
- takeDamage(): void

**Enemy extends GameObject**
- sides: number (4-8)
- pathCurve: BezierCurve
- pathProgress: number (0-1)
- customSprite: ImageData | null
- points: number (score value)

**Bullet extends GameObject**
- initialSpeed: number
- acceleration: number
- size: number (affected by power-ups)
- lifeTime: number

**PowerUp extends GameObject**
- type: 'diamond'
- collected: boolean
- fallSpeed: number

#### **BezierCurve**
- controlPoints: Vector2[] (n points for n-sided polygon)
- getPoint(t: number): Vector2 (0 <= t <= 1)
- getTangent(t: number): Vector2

#### **SpriteEditor**
- selectedShape: number (4-8 sides)
- canvas: HTMLCanvasElement
- drawingContext: CanvasRenderingContext2D
- brushSize: number
- color: string
- isDrawing: boolean
- paint(x: number, y: number): void
- clear(): void
- save(): void
- load(sides: number): ImageData | null

#### **StorageManager**
- saveCustomSprite(sides: number, data: ImageData): void
- loadCustomSprite(sides: number): ImageData | null
- saveHighScore(score: number): void
- loadHighScore(): number

---

## 2. Technology Choices

### 2.1 Core Technologies

**TypeScript**
- Type safety for complex game logic
- Better tooling and refactoring support
- Interface definitions for game entities
- Compile-time error detection

**Canvas API (2D Context)**
- Native browser support
- Sufficient performance for 2D game
- Direct pixel manipulation for sprite editor
- No external rendering library needed

**Web Storage API**
- localStorage for custom sprites
- Persistent high scores
- Simple key-value storage sufficient for needs

### 2.2 Build Tools

**Vite**
- Fast development server with HMR
- TypeScript support out of the box
- Efficient production builds
- Simple configuration

**ESLint + Prettier**
- Code quality enforcement
- Consistent formatting
- TypeScript-aware linting

### 2.3 Testing Tools

**Vitest**
- Fast unit testing
- Jest-compatible API
- Native TypeScript support
- Coverage reporting

**Playwright**
- End-to-end browser testing
- Touch event simulation
- Canvas screenshot comparison
- Headless mode for CI/CD

### 2.4 Optional Libraries

**None required for core functionality**, but consider:

**For Polish (Optional):**
- Web Audio API (native) for sound effects
- requestAnimationFrame polyfill for older browsers

**Why No Game Framework?**
- Requirements are specific and well-defined
- Custom implementation gives full control
- Smaller bundle size
- Educational value in implementing core systems

---

## 3. Key Algorithms

### 3.1 Bezier Curve Navigation

**Purpose:** Enemies follow smooth curved paths based on their polygon sides

**Algorithm: De Casteljau's Algorithm**

```typescript
function bezierPoint(t: number, points: Vector2[]): Vector2 {
  if (points.length === 1) return points[0];

  const newPoints: Vector2[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    newPoints.push({
      x: (1 - t) * points[i].x + t * points[i + 1].x,
      y: (1 - t) * points[i].y + t * points[i + 1].y
    });
  }

  return bezierPoint(t, newPoints);
}
```

**Control Point Generation:**
- For n-sided polygon: generate n control points
- Start: top of screen (random x)
- End: bottom of screen (random x)
- Middle points: distributed vertically with random horizontal offsets
- Ensures curve stays mostly within screen bounds

**Path Following:**
```typescript
update(deltaTime: number) {
  this.pathProgress += this.speed * deltaTime;
  if (this.pathProgress >= 1.0) {
    this.active = false; // Enemy escaped
  }
  this.position = this.pathCurve.getPoint(this.pathProgress);

  // Orient enemy to face direction of travel
  const tangent = this.pathCurve.getTangent(this.pathProgress);
  this.rotation = Math.atan2(tangent.y, tangent.x);
}
```

### 3.2 Collision Detection

**Spatial Partitioning (Grid-Based)**

```typescript
class CollisionGrid {
  private cellSize: number = 100;
  private grid: Map<string, GameObject[]> = new Map();

  getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  insert(obj: GameObject): void {
    const key = this.getCellKey(obj.position.x, obj.position.y);
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key)!.push(obj);
  }

  getNearby(obj: GameObject): GameObject[] {
    const nearby: GameObject[] = [];
    const cellX = Math.floor(obj.position.x / this.cellSize);
    const cellY = Math.floor(obj.position.y / this.cellSize);

    // Check 3x3 grid around object
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`;
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key)!);
        }
      }
    }
    return nearby;
  }
}
```

**Circle-Circle (Bullet vs Enemy bounding circle)**

```typescript
function circleCollision(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (a.radius + b.radius);
}
```

**Point-in-Polygon (Refined collision using ray casting)**

```typescript
function pointInPolygon(point: Vector2, polygon: Vector2[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y))
      && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }
  return inside;
}
```

**Polygon-Polygon (Player vs Enemy using SAT)**

```typescript
function polygonCollision(poly1: Vector2[], poly2: Vector2[]): boolean {
  // Separating Axis Theorem (SAT)
  const axes = [...getAxes(poly1), ...getAxes(poly2)];

  for (const axis of axes) {
    const proj1 = projectPolygon(poly1, axis);
    const proj2 = projectPolygon(poly2, axis);

    if (proj1.max < proj2.min || proj2.max < proj1.min) {
      return false; // Separation found
    }
  }

  return true; // No separation = collision
}
```

### 3.3 Player Movement

**Constant Velocity Movement to Touch Point**

```typescript
class Player {
  private moveSpeed: number = 300; // pixels per second

  onTouch(touchX: number, touchY: number): void {
    this.targetPosition = { x: touchX, y: touchY };
    this.fire();
  }

  update(deltaTime: number): void {
    if (!this.targetPosition) return;

    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Reached destination
      this.targetPosition = null;
      this.velocity = { x: 0, y: 0 };
      return;
    }

    // Move at constant speed toward target
    const dirX = dx / distance;
    const dirY = dy / distance;
    this.velocity = {
      x: dirX * this.moveSpeed,
      y: dirY * this.moveSpeed
    };

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }
}
```

### 3.4 Bullet Acceleration

**Linearly Increasing Velocity**

```typescript
class Bullet {
  private initialSpeed: number = 400; // pixels/second
  private acceleration: number = 200; // pixels/second^2
  private currentSpeed: number;

  constructor() {
    this.currentSpeed = this.initialSpeed;
  }

  update(deltaTime: number): void {
    this.currentSpeed += this.acceleration * deltaTime;
    this.position.y -= this.currentSpeed * deltaTime;

    // Deactivate if off-screen
    if (this.position.y < -50) {
      this.active = false;
    }
  }
}
```

### 3.5 Power-Up System

**Diamond Size Calculation**

```typescript
class PowerUpSystem {
  private baseBulletArea: number = Math.PI * 5 * 5; // radius = 5
  private maxMultiplier: number = 4.0;

  collectDiamond(player: Player): void {
    const currentArea = Math.PI * player.bulletRadius * player.bulletRadius;
    const increase = this.baseBulletArea * 0.10; // 10% increase
    const newArea = Math.min(
      currentArea + increase,
      this.baseBulletArea * this.maxMultiplier
    );
    player.bulletRadius = Math.sqrt(newArea / Math.PI);
  }
}
```

### 3.6 Wave Generation

**Enemy Wave Patterns**

```typescript
interface WaveConfig {
  enemyCount: number;
  enemySides: number[];
  spawnDelay: number; // ms between spawns
  difficulty: number; // affects speed
}

class WaveManager {
  private currentWave: number = 0;

  generateWave(): WaveConfig {
    const enemyCount = 4 + Math.min(4, Math.floor(this.currentWave / 2));
    const difficulty = 1.0 + (this.currentWave * 0.1);

    const enemySides: number[] = [];
    for (let i = 0; i < enemyCount; i++) {
      // Higher waves = more complex enemies
      const minSides = 4 + Math.min(4, Math.floor(this.currentWave / 3));
      const maxSides = 8;
      enemySides.push(randomInt(minSides, maxSides));
    }

    return {
      enemyCount,
      enemySides,
      spawnDelay: Math.max(500, 2000 - this.currentWave * 100),
      difficulty
    };
  }
}
```

---

## 4. Data Structures

### 4.1 Core Types

```typescript
// Fundamental Types
interface Vector2 {
  x: number;
  y: number;
}

interface Circle {
  x: number;
  y: number;
  radius: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// Game State
interface GameState {
  mode: 'menu' | 'game' | 'editor' | 'paused' | 'gameover';
  score: number;
  highScore: number;
  currentWave: number;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  particles: Particle[];
}

// Configuration
interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  player: {
    size: number;
    speed: number;
    maxLives: number;
    initialBulletRadius: number;
    fireRate: number; // ms between shots
  };
  enemy: {
    minSize: number;
    maxSize: number;
    baseSpeed: number;
  };
  bullet: {
    initialSpeed: number;
    acceleration: number;
  };
  powerUp: {
    fallSpeed: number;
    bulletSizeIncrease: number; // 0.10 for 10%
    maxBulletMultiplier: number; // 4.0 for 4x
  };
}

// Sprite Storage
interface CustomSpriteData {
  sides: number;
  imageData: string; // base64 encoded ImageData
  timestamp: number;
}

// Wave Data
interface WaveData {
  waveNumber: number;
  enemies: {
    sides: number;
    spawnTime: number;
    curve: {
      controlPoints: Vector2[];
    };
  }[];
}

// Editor State
interface EditorState {
  selectedSides: number;
  brushColor: string;
  brushSize: number;
  isDrawing: boolean;
  hasUnsavedChanges: boolean;
  previewPolygon: Vector2[];
}
```

### 4.2 Object Pools

**Purpose:** Reuse objects to reduce garbage collection

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

  clear(): void {
    this.available = [];
    this.inUse.clear();
  }
}

// Usage
const bulletPool = new ObjectPool(
  () => new Bullet(),
  (bullet) => {
    bullet.active = false;
    bullet.position = { x: 0, y: 0 };
    bullet.velocity = { x: 0, y: 0 };
  },
  100
);
```

### 4.3 Event System

```typescript
type GameEvent =
  | { type: 'ENEMY_DESTROYED'; enemy: Enemy; position: Vector2 }
  | { type: 'PLAYER_HIT'; livesRemaining: number }
  | { type: 'WAVE_COMPLETE'; waveNumber: number }
  | { type: 'POWERUP_COLLECTED'; powerUpType: string }
  | { type: 'GAME_OVER'; finalScore: number };

class EventBus {
  private listeners: Map<string, Array<(event: GameEvent) => void>> = new Map();

  on(eventType: string, callback: (event: GameEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  emit(event: GameEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(cb => cb(event));
    }
  }

  off(eventType: string, callback: (event: GameEvent) => void): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}
```

---

## 5. Testing Strategy

### 5.1 Unit Testing (Vitest)

**Test Coverage Areas:**

**Geometry & Math Utilities**
```typescript
describe('BezierCurve', () => {
  test('getPoint at t=0 returns first control point', () => {
    const curve = new BezierCurve([
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 }
    ]);
    expect(curve.getPoint(0)).toEqual({ x: 0, y: 0 });
  });

  test('getPoint at t=1 returns last control point', () => {
    const curve = new BezierCurve([
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 }
    ]);
    expect(curve.getPoint(1)).toEqual({ x: 100, y: 0 });
  });

  test('getPoint at t=0.5 is between control points', () => {
    const curve = new BezierCurve([
      { x: 0, y: 0 },
      { x: 100, y: 0 }
    ]);
    const point = curve.getPoint(0.5);
    expect(point.x).toBeCloseTo(50, 1);
  });
});
```

**Collision Detection**
```typescript
describe('Collision Detection', () => {
  test('detects circle-circle collision', () => {
    const a = { x: 0, y: 0, radius: 10 };
    const b = { x: 15, y: 0, radius: 10 };
    expect(circleCollision(a, b)).toBe(true);
  });

  test('no collision when circles far apart', () => {
    const a = { x: 0, y: 0, radius: 10 };
    const b = { x: 100, y: 0, radius: 10 };
    expect(circleCollision(a, b)).toBe(false);
  });

  test('point inside polygon detection', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ];
    expect(pointInPolygon({ x: 50, y: 50 }, square)).toBe(true);
    expect(pointInPolygon({ x: 150, y: 50 }, square)).toBe(false);
  });
});
```

**Game Logic**
```typescript
describe('Player', () => {
  test('loses life when health depleted', () => {
    const player = new Player();
    const initialLives = player.lives;
    player.takeDamage();
    expect(player.lives).toBe(initialLives - 1);
  });

  test('moves toward target position', () => {
    const player = new Player();
    player.position = { x: 0, y: 0 };
    player.onTouch(100, 0);
    player.update(0.1); // 100ms
    expect(player.position.x).toBeGreaterThan(0);
  });

  test('bullet size increases with power-up', () => {
    const player = new Player();
    const initialRadius = player.bulletRadius;
    player.collectPowerUp('diamond');
    expect(player.bulletRadius).toBeGreaterThan(initialRadius);
  });

  test('bullet size caps at 4x area', () => {
    const player = new Player();
    const baseArea = Math.PI * player.bulletRadius ** 2;

    // Collect many power-ups
    for (let i = 0; i < 50; i++) {
      player.collectPowerUp('diamond');
    }

    const finalArea = Math.PI * player.bulletRadius ** 2;
    expect(finalArea).toBeLessThanOrEqual(baseArea * 4 + 0.001);
  });
});

describe('WaveManager', () => {
  test('generates correct number of enemies', () => {
    const waveManager = new WaveManager();
    const wave = waveManager.generateWave();
    expect(wave.enemyCount).toBeGreaterThanOrEqual(4);
    expect(wave.enemyCount).toBeLessThanOrEqual(8);
  });

  test('difficulty increases with wave number', () => {
    const waveManager = new WaveManager();
    const wave1 = waveManager.generateWave();
    waveManager.currentWave = 10;
    const wave2 = waveManager.generateWave();
    expect(wave2.difficulty).toBeGreaterThan(wave1.difficulty);
  });
});
```

**Storage**
```typescript
describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saves and loads custom sprite', () => {
    const storage = new StorageManager();
    const mockImageData = createMockImageData(100, 100);

    storage.saveCustomSprite(5, mockImageData);
    const loaded = storage.loadCustomSprite(5);

    expect(loaded).not.toBeNull();
    expect(loaded?.width).toBe(100);
  });

  test('saves high score', () => {
    const storage = new StorageManager();
    storage.saveHighScore(1000);
    expect(storage.loadHighScore()).toBe(1000);
  });

  test('updates high score only if higher', () => {
    const storage = new StorageManager();
    storage.saveHighScore(1000);
    storage.saveHighScore(500);
    expect(storage.loadHighScore()).toBe(1000);
  });
});
```

### 5.2 Integration Testing (Vitest + JSDOM)

```typescript
describe('Game Integration', () => {
  test('enemy destroyed when hit by bullet', () => {
    const game = new GameEngine();
    game.initialize();

    const enemy = new Enemy(5, game.canvas.width / 2, 100);
    const bullet = new Bullet(
      game.canvas.width / 2,
      100,
      game.player.bulletRadius
    );

    game.enemies.push(enemy);
    game.bullets.push(bullet);

    game.update(0.016); // One frame

    expect(enemy.active).toBe(false);
    expect(bullet.active).toBe(false);
    expect(game.score).toBeGreaterThan(0);
  });

  test('wave completes and spawns diamond', () => {
    const game = new GameEngine();
    game.initialize();
    game.startWave();

    // Destroy all enemies
    game.enemies.forEach(enemy => enemy.active = false);
    game.update(0.016);

    expect(game.powerUps.length).toBe(1);
    expect(game.powerUps[0].type).toBe('diamond');
  });

  test('game over when lives reach zero', () => {
    const game = new GameEngine();
    game.initialize();
    game.player.lives = 1;
    game.player.takeDamage();

    expect(game.state.mode).toBe('gameover');
  });
});
```

### 5.3 End-to-End Testing (Playwright)

**Automated Browser Tests Without User Intervention**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('complete game session', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for game to load
    await page.waitForSelector('canvas');

    // Start game
    await page.click('button:has-text("Start Game")');

    // Simulate automated gameplay
    const canvas = await page.locator('canvas');
    const box = await canvas.boundingBox();

    // Auto-play: shoot and move
    for (let i = 0; i < 100; i++) {
      const x = box!.x + Math.random() * box!.width;
      const y = box!.y + Math.random() * box!.height;
      await canvas.click({ position: { x, y } });
      await page.waitForTimeout(100);
    }

    // Verify game is running
    const score = await page.textContent('.score');
    expect(parseInt(score!)).toBeGreaterThan(0);
  });

  test('editor saves custom sprite', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("Editor")');

    // Select pentagon
    await page.click('button[data-sides="5"]');

    // Draw on canvas
    const canvas = await page.locator('canvas.editor-canvas');
    const box = await canvas.boundingBox();

    for (let i = 0; i < 10; i++) {
      const x = box!.x + 50 + i * 5;
      const y = box!.y + 50;
      await canvas.click({ position: { x, y } });
    }

    // Save
    await page.click('button:has-text("Save")');

    // Verify saved
    const saved = await page.evaluate(() => {
      return localStorage.getItem('customSprite_5') !== null;
    });
    expect(saved).toBe(true);
  });
});

test.describe('Visual Regression', () => {
  test('player sprite renders correctly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('button:has-text("Start Game")');

    // Take screenshot of game area
    const canvas = await page.locator('canvas');
    await expect(canvas).toHaveScreenshot('player-initial.png');
  });

  test('enemy sprites render correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/test-render');

    // Test page that renders all enemy types
    for (let sides = 4; sides <= 8; sides++) {
      const enemy = await page.locator(`[data-enemy-sides="${sides}"]`);
      await expect(enemy).toHaveScreenshot(`enemy-${sides}-sides.png`);
    }
  });
});

test.describe('Performance', () => {
  test('maintains 60fps with many entities', async ({ page }) => {
    await page.goto('http://localhost:5173/stress-test');

    // Stress test page with 100+ entities
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frames: number[] = [];
        let lastTime = performance.now();
        let count = 0;

        function measureFrame() {
          const now = performance.now();
          const delta = now - lastTime;
          frames.push(1000 / delta);
          lastTime = now;
          count++;

          if (count < 300) { // 5 seconds at 60fps
            requestAnimationFrame(measureFrame);
          } else {
            const avgFps = frames.reduce((a, b) => a + b) / frames.length;
            resolve(avgFps);
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    expect(metrics).toBeGreaterThan(55); // Allow some variance
  });
});
```

### 5.4 Test Utilities

**Mock Objects**

```typescript
// test/mocks/canvas.ts
export function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
}

export function createMockContext(): CanvasRenderingContext2D {
  const canvas = createMockCanvas();
  return canvas.getContext('2d')!;
}

// test/mocks/touch.ts
export function createMockTouchEvent(
  x: number,
  y: number,
  type: 'start' | 'move' | 'end'
): TouchEvent {
  const touch = {
    identifier: 0,
    target: null,
    clientX: x,
    clientY: y,
    screenX: x,
    screenY: y,
    pageX: x,
    pageY: y,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 1
  };

  return new TouchEvent(`touch${type}`, {
    touches: type === 'end' ? [] : [touch as Touch],
    targetTouches: [],
    changedTouches: [touch as Touch],
    bubbles: true
  });
}

// test/helpers/gameSetup.ts
export function createTestGame(overrides?: Partial<GameConfig>): GameEngine {
  const game = new GameEngine({
    ...defaultConfig,
    ...overrides
  });
  game.initialize();
  return game;
}

export function spawnTestEnemy(
  game: GameEngine,
  x: number,
  y: number,
  sides: number
): Enemy {
  const enemy = new Enemy(sides, x, y);
  game.enemies.push(enemy);
  return enemy;
}
```

### 5.5 CI/CD Testing

**GitHub Actions Workflow**

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Generate coverage
        run: npm run coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 6. File Structure for TypeScript Implementation

```
drawshoot/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       └── sounds/          # Optional sound effects
├── src/
│   ├── main.ts             # Entry point
│   ├── config.ts           # Game configuration
│   │
│   ├── core/               # Core game systems
│   │   ├── GameEngine.ts
│   │   ├── Renderer.ts
│   │   ├── InputManager.ts
│   │   ├── PhysicsEngine.ts
│   │   ├── CollisionDetector.ts
│   │   ├── EventBus.ts
│   │   └── ObjectPool.ts
│   │
│   ├── entities/           # Game objects
│   │   ├── GameObject.ts   # Base class
│   │   ├── Player.ts
│   │   ├── Enemy.ts
│   │   ├── Bullet.ts
│   │   ├── PowerUp.ts
│   │   └── Particle.ts
│   │
│   ├── systems/            # Game logic systems
│   │   ├── WaveManager.ts
│   │   ├── ScoreManager.ts
│   │   ├── ParticleSystem.ts
│   │   └── PowerUpSystem.ts
│   │
│   ├── geometry/           # Math and geometry utilities
│   │   ├── Vector2.ts
│   │   ├── BezierCurve.ts
│   │   ├── Polygon.ts
│   │   └── collision.ts    # Collision algorithms
│   │
│   ├── editor/             # Sprite editor
│   │   ├── SpriteEditor.ts
│   │   ├── EditorUI.ts
│   │   └── EditorCanvas.ts
│   │
│   ├── storage/            # Persistence
│   │   └── StorageManager.ts
│   │
│   ├── ui/                 # UI components
│   │   ├── MenuScreen.ts
│   │   ├── HUD.ts
│   │   ├── GameOverScreen.ts
│   │   └── PauseScreen.ts
│   │
│   ├── utils/              # Utilities
│   │   ├── math.ts         # Math helpers
│   │   ├── random.ts       # Random generation
│   │   └── performance.ts  # FPS counter, profiling
│   │
│   └── types/              # TypeScript types
│       ├── index.ts        # Main type exports
│       ├── game.ts         # Game-related types
│       ├── editor.ts       # Editor types
│       └── events.ts       # Event types
│
├── tests/
│   ├── unit/
│   │   ├── geometry/
│   │   │   ├── BezierCurve.test.ts
│   │   │   ├── collision.test.ts
│   │   │   └── Polygon.test.ts
│   │   ├── entities/
│   │   │   ├── Player.test.ts
│   │   │   ├── Enemy.test.ts
│   │   │   └── Bullet.test.ts
│   │   ├── systems/
│   │   │   ├── WaveManager.test.ts
│   │   │   └── PowerUpSystem.test.ts
│   │   └── storage/
│   │       └── StorageManager.test.ts
│   │
│   ├── integration/
│   │   ├── game-flow.test.ts
│   │   ├── collision-system.test.ts
│   │   └── editor.test.ts
│   │
│   ├── e2e/
│   │   ├── gameplay.spec.ts
│   │   ├── editor.spec.ts
│   │   └── visual-regression.spec.ts
│   │
│   ├── mocks/
│   │   ├── canvas.ts
│   │   ├── touch.ts
│   │   └── localStorage.ts
│   │
│   └── helpers/
│       ├── gameSetup.ts
│       └── testUtils.ts
│
├── .github/
│   └── workflows/
│       └── test.yml        # CI/CD configuration
│
├── playwright.config.ts    # E2E test config
├── vitest.config.ts        # Unit test config
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Build config
├── package.json
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

---

## 7. Implementation Phases

### Phase 1: Core Foundation (Week 1)
- Setup project structure and tooling
- Implement core types and interfaces
- Create GameEngine with game loop
- Basic Renderer (canvas setup, clear screen)
- InputManager (touch event handling)
- Simple player movement

**Deliverable:** Player triangle moves to touch point on canvas

### Phase 2: Entities & Physics (Week 1-2)
- GameObject base class
- Player entity (full movement, firing)
- Bullet entity (acceleration)
- Enemy entity (basic spawning)
- PhysicsEngine (position updates)
- Basic collision detection (circle-circle)

**Deliverable:** Player can shoot bullets that destroy enemies

### Phase 3: Bezier Curves & Enemy Movement (Week 2)
- BezierCurve class with de Casteljau's algorithm
- Control point generation for n-sided polygons
- Enemy path following
- Tangent calculation for rotation

**Deliverable:** Enemies follow smooth curved paths

### Phase 4: Advanced Collision & Wave System (Week 2-3)
- Spatial partitioning (collision grid)
- Polygon collision (SAT)
- WaveManager (enemy waves)
- PowerUp system
- ScoreManager

**Deliverable:** Full wave-based gameplay with power-ups

### Phase 5: Editor Mode (Week 3)
- SpriteEditor canvas setup
- Polygon shape selection
- Paint tool implementation
- StorageManager (save/load sprites)
- Editor UI (buttons, color picker)

**Deliverable:** Working sprite editor with persistence

### Phase 6: Polish & UI (Week 4)
- Menu system
- HUD (score, lives, wave number)
- Game over screen
- Particle effects
- Sound effects (optional)
- Visual polish (smooth animations)

**Deliverable:** Complete game experience

### Phase 7: Testing & Optimization (Week 4)
- Unit test coverage (>80%)
- Integration tests
- E2E tests with Playwright
- Performance optimization
- Object pooling
- Code cleanup and documentation

**Deliverable:** Production-ready game

---

## 8. Key Implementation Notes

### 8.1 Touch Optimization

**Prevent Default Behaviors**
```typescript
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevent scrolling
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault(); // Prevent scrolling while drawing
}, { passive: false });
```

**Touch Point Coordinate Conversion**
```typescript
function getTouchPos(canvas: HTMLCanvasElement, touch: Touch): Vector2 {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height)
  };
}
```

### 8.2 Performance Considerations

**Frame Rate Management**
```typescript
class GameEngine {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedDeltaTime: number = 1 / 60; // 60 FPS

  private gameLoop(currentTime: number): void {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // Fixed time step for physics
    while (this.accumulator >= this.fixedDeltaTime) {
      this.update(this.fixedDeltaTime);
      this.accumulator -= this.fixedDeltaTime;
    }

    // Render with interpolation
    this.render(this.accumulator / this.fixedDeltaTime);

    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
```

**Entity Culling**
```typescript
function isOnScreen(pos: Vector2, padding: number = 50): boolean {
  return pos.x > -padding &&
         pos.x < canvas.width + padding &&
         pos.y > -padding &&
         pos.y < canvas.height + padding;
}

// In update loop
entities.forEach(entity => {
  if (isOnScreen(entity.position)) {
    entity.update(deltaTime);
  } else if (entity.position.y < -100) {
    entity.active = false; // Deactivate off-screen entities
  }
});
```

**Batch Rendering**
```typescript
class Renderer {
  render(entities: GameObject[]): void {
    // Group by render type
    const sprites = entities.filter(e => e.hasSprite);
    const polygons = entities.filter(e => e.isPolygon);
    const circles = entities.filter(e => e.isCircle);

    // Batch render each type
    this.renderCircles(circles);
    this.renderPolygons(polygons);
    this.renderSprites(sprites);
  }
}
```

### 8.3 Storage Format

**Custom Sprite Storage**
```typescript
interface StoredSprite {
  version: number;
  sides: number;
  width: number;
  height: number;
  data: string; // base64 encoded image data
  timestamp: number;
}

function saveSprite(sides: number, imageData: ImageData): void {
  const stored: StoredSprite = {
    version: 1,
    sides,
    width: imageData.width,
    height: imageData.height,
    data: imageDataToBase64(imageData),
    timestamp: Date.now()
  };

  localStorage.setItem(
    `customSprite_${sides}`,
    JSON.stringify(stored)
  );
}
```

### 8.4 Responsive Canvas

**Canvas Sizing for Mobile**
```typescript
function resizeCanvas(): void {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const container = canvas.parentElement!;

  const scale = window.devicePixelRatio;
  const width = container.clientWidth;
  const height = container.clientHeight;

  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call
```

---

## 9. Potential Challenges & Solutions

### Challenge 1: Smooth Bezier Curves
**Problem:** Jerky movement along curves
**Solution:**
- Use adaptive step size based on curve complexity
- Cache curve points for frequently used paths
- Apply easing functions for smoother acceleration/deceleration

### Challenge 2: Collision Detection Performance
**Problem:** O(n²) collision checks with many entities
**Solution:**
- Spatial partitioning (grid-based)
- Early rejection with bounding circles
- Only check nearby entities

### Challenge 3: Touch Event Latency
**Problem:** Delay between touch and response
**Solution:**
- Use `touchstart` instead of `click`
- Set `{ passive: false }` for preventDefault
- Implement touch prediction based on velocity

### Challenge 4: Mobile Performance
**Problem:** Low FPS on older devices
**Solution:**
- Object pooling to reduce GC
- Limit particle effects
- Reduce resolution on slow devices
- Use requestAnimationFrame with deltaTime

### Challenge 5: Editor Sprite Quality
**Problem:** Jagged edges on painted sprites
**Solution:**
- Implement brush smoothing
- Anti-aliasing for rendering
- Higher resolution sprite storage

---

## 10. Future Enhancements

**Post-MVP Features:**

1. **Enhanced Gameplay**
   - Multiple player ship types
   - Different bullet patterns
   - Boss enemies at milestone waves
   - Combo system for consecutive hits

2. **Editor Improvements**
   - Undo/redo functionality
   - Layer system for complex designs
   - Animation frames for animated enemies
   - Import/export sprite library

3. **Social Features**
   - Online leaderboards
   - Share custom sprites with others
   - Challenge mode with specific waves

4. **Audio**
   - Background music
   - Sound effects for actions
   - Audio feedback for hits/misses

5. **Visual Effects**
   - Screen shake on collisions
   - Slow-motion on near-misses
   - Trail effects for bullets
   - Background parallax scrolling

---

## Summary

This technical plan provides a comprehensive blueprint for implementing a browser-based 2D vertical scrolling shooter game with the following key features:

**Core Strengths:**
- Pure TypeScript + Canvas API (no framework overhead)
- ECS-lite architecture for clean separation of concerns
- Object pooling for performance
- Comprehensive testing strategy (unit, integration, E2E)
- Touch-optimized for mobile devices
- Local storage for custom sprites and progress

**Key Technical Highlights:**
- Bezier curve-based enemy movement with n control points
- Spatial partitioning for efficient collision detection
- Constant velocity player movement
- Linearly accelerating bullets
- Area-based power-up scaling

**Testing Approach:**
- Automated unit tests for all game logic
- Integration tests for system interactions
- Playwright E2E tests that run without user intervention
- Visual regression testing
- Performance benchmarks

**Implementation Timeline:**
- 4 weeks for full implementation
- Phased approach from core mechanics to polish
- Test-driven development throughout

The architecture is modular, testable, and optimized for the specific requirements of this game. Each component has a clear responsibility and can be developed and tested independently.
