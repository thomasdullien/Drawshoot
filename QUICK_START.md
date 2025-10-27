# Quick Start Guide

Get started with Drawshoot development in 5 minutes!

## Initial Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server will open at `http://localhost:5173`

## Project Overview

You have 4 main documentation files:

1. **TECHNICAL_PLAN.md** - Complete architecture, algorithms, and design
2. **IMPLEMENTATION_ROADMAP.md** - Day-by-day implementation guide
3. **ALGORITHM_REFERENCE.md** - Copy-paste ready code snippets
4. **README.md** - Project overview and commands

## Where to Start

### Option 1: Follow the Roadmap

Open `IMPLEMENTATION_ROADMAP.md` and follow Day 1:

1. Create `src/types/index.ts`
2. Create `src/geometry/Vector2.ts`
3. Create `src/config.ts`
4. Write tests as you go

### Option 2: Start with Core Game Loop

1. Create minimal HTML:
```bash
mkdir -p public
```

Then create `public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drawshoot</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    canvas {
      border: 1px solid #333;
      background: #111;
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="800" height="600"></canvas>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

2. Create `src/main.ts`:
```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function gameLoop() {
  // Clear screen
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw test triangle (player)
  ctx.fillStyle = '#0ff';
  ctx.beginPath();
  ctx.moveTo(400, 300);
  ctx.lineTo(380, 330);
  ctx.lineTo(420, 330);
  ctx.closePath();
  ctx.fill();

  requestAnimationFrame(gameLoop);
}

gameLoop();
```

3. Run `npm run dev` and you should see a cyan triangle!

## Development Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run E2E tests (requires build)

# Code Quality
npm run lint         # Check for errors
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## File Structure to Create

Based on the roadmap, you'll create:

```
src/
├── main.ts                 # Entry point
├── config.ts               # Constants
├── types/
│   ├── index.ts           # Main types
│   ├── game.ts            # Game types
│   └── editor.ts          # Editor types
├── geometry/
│   ├── Vector2.ts         # Vector math
│   ├── BezierCurve.ts     # Curve calculations
│   ├── Polygon.ts         # Polygon utilities
│   └── collision.ts       # Collision detection
├── core/
│   ├── GameEngine.ts      # Main game loop
│   ├── Renderer.ts        # Drawing system
│   ├── InputManager.ts    # Touch/mouse input
│   ├── PhysicsEngine.ts   # Movement/physics
│   ├── CollisionDetector.ts # Collision system
│   ├── EventBus.ts        # Event system
│   └── ObjectPool.ts      # Object pooling
├── entities/
│   ├── GameObject.ts      # Base class
│   ├── Player.ts          # Player
│   ├── Enemy.ts           # Enemy
│   ├── Bullet.ts          # Bullet
│   ├── PowerUp.ts         # Power-ups
│   └── Particle.ts        # Particles
├── systems/
│   ├── WaveManager.ts     # Wave system
│   ├── ScoreManager.ts    # Scoring
│   ├── ParticleSystem.ts  # Particle effects
│   └── PowerUpSystem.ts   # Power-up logic
├── editor/
│   ├── SpriteEditor.ts    # Editor logic
│   ├── EditorCanvas.ts    # Drawing canvas
│   └── EditorUI.ts        # UI controls
├── storage/
│   └── StorageManager.ts  # localStorage
├── ui/
│   ├── MenuScreen.ts      # Main menu
│   ├── HUD.ts             # In-game UI
│   ├── GameOverScreen.ts  # Game over
│   └── PauseScreen.ts     # Pause menu
└── utils/
    ├── math.ts            # Math helpers
    ├── random.ts          # Random generation
    └── performance.ts     # FPS counter
```

## Key Algorithms to Implement

All code is in `ALGORITHM_REFERENCE.md`, but here are the critical ones:

1. **Bezier Curve** (Enemy movement)
   - See: ALGORITHM_REFERENCE.md → Bezier Curves

2. **Collision Detection** (Bullet vs Enemy)
   - See: ALGORITHM_REFERENCE.md → Circle-Circle Collision

3. **Player Movement** (Constant velocity to target)
   - See: ALGORITHM_REFERENCE.md → Player Movement

4. **Bullet Physics** (Linear acceleration)
   - See: ALGORITHM_REFERENCE.md → Bullet Physics

5. **Power-up System** (Area-based scaling)
   - See: ALGORITHM_REFERENCE.md → Power-up Calculations

## Testing Approach

Write tests FIRST (TDD):

1. Create test file: `tests/unit/geometry/Vector2.test.ts`
2. Write failing tests
3. Implement code to pass tests
4. Refactor

Example test:

```typescript
import { describe, test, expect } from 'vitest';
import { Vector2 } from '@/geometry/Vector2';

describe('Vector2', () => {
  test('adds two vectors correctly', () => {
    const a = new Vector2(1, 2);
    const b = new Vector2(3, 4);
    const result = a.add(b);

    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });
});
```

## Tips for Success

### 1. Start Small
Don't try to build everything at once. Get one feature working, then add the next.

### 2. Test in Browser Constantly
Keep `npm run dev` running and refresh often to see your changes.

### 3. Use Console Logging
Add `console.log()` liberally when debugging. Remove them later.

### 4. Commit Often
```bash
git add .
git commit -m "Implement Vector2 class with tests"
```

### 5. Follow the Roadmap
The `IMPLEMENTATION_ROADMAP.md` is designed to build features in the right order.

### 6. Copy from Algorithm Reference
Don't reinvent the wheel - the algorithms are ready to use in `ALGORITHM_REFERENCE.md`.

## Common First-Time Issues

### Issue: Canvas is blank
**Solution:** Check browser console for errors. Make sure canvas is getting context.

### Issue: TypeScript errors about imports
**Solution:** Make sure `tsconfig.json` paths are set up correctly. Already configured!

### Issue: Touch events not working
**Solution:**
1. Add `{ passive: false }` to event listeners
2. Call `event.preventDefault()`
3. Test with mouse events first

### Issue: Game runs too fast/slow
**Solution:** Use delta time in all updates. See `ALGORITHM_REFERENCE.md` → Fixed Time Step.

## Recommended First Session

**Goal: See player triangle move on screen (1-2 hours)**

1. Create `public/index.html` (see above)
2. Create `src/main.ts` with basic game loop
3. Create `src/types/index.ts`:
```typescript
export interface Vector2 {
  x: number;
  y: number;
}
```
4. Create `src/geometry/Vector2.ts` with basic operations
5. Add click handler to move triangle
6. See it work in browser!

After this, you'll have:
- ✅ Canvas rendering
- ✅ Game loop running
- ✅ Basic interactivity
- ✅ Confidence to continue

Then follow the roadmap for Day 2+.

## Getting Help

1. **Check the docs first:**
   - `TECHNICAL_PLAN.md` for architecture questions
   - `ALGORITHM_REFERENCE.md` for code examples
   - `IMPLEMENTATION_ROADMAP.md` for what to build next

2. **Debug systematically:**
   - Check browser console
   - Add console.logs
   - Isolate the problem
   - Test in smaller pieces

3. **Reference implementations:**
   - All key algorithms are in `ALGORITHM_REFERENCE.md`
   - Copy, paste, adapt

## Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm run dev`
3. ✅ Read `TECHNICAL_PLAN.md` (10 minutes)
4. ✅ Start `IMPLEMENTATION_ROADMAP.md` Day 1
5. ✅ Reference `ALGORITHM_REFERENCE.md` when coding

**You're ready to start building! Good luck!** 🚀
