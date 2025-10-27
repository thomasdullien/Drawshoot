# Implementation Roadmap

This document provides a detailed, step-by-step guide to implementing the Drawshoot game based on the [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md).

## Pre-Implementation Checklist

- [ ] Review TECHNICAL_PLAN.md thoroughly
- [ ] Set up development environment
- [ ] Install dependencies: `npm install`
- [ ] Verify dev server works: `npm run dev`
- [ ] Verify tests run: `npm test`

## Phase 1: Core Foundation (Week 1)

### Day 1-2: Project Setup & Basic Types

**Files to create:**
- [ ] `src/types/index.ts` - Core type definitions
- [ ] `src/types/game.ts` - Game-specific types
- [ ] `src/geometry/Vector2.ts` - Vector2 class
- [ ] `src/config.ts` - Game configuration constants

**Tasks:**
1. Define all TypeScript interfaces (Vector2, Circle, Bounds, GameState, etc.)
2. Create GameConfig with all game constants
3. Implement Vector2 utility class with methods:
   - add, subtract, multiply, divide
   - magnitude, normalize
   - distance, dot product

**Tests:**
```typescript
// tests/unit/geometry/Vector2.test.ts
- Vector addition/subtraction
- Vector normalization
- Distance calculation
```

**Validation:**
- All types compile without errors
- Vector2 has 100% test coverage

---

### Day 2-3: Game Loop & Rendering

**Files to create:**
- [ ] `src/core/GameEngine.ts` - Main game engine
- [ ] `src/core/Renderer.ts` - Canvas rendering system
- [ ] `public/index.html` - HTML structure
- [ ] `src/main.ts` - Entry point
- [ ] `src/utils/performance.ts` - FPS counter

**Tasks:**
1. Create HTML canvas element with proper sizing
2. Implement GameEngine with:
   - requestAnimationFrame game loop
   - Fixed timestep physics (60 FPS)
   - Delta time calculation
3. Implement Renderer with:
   - Canvas context management
   - Clear screen method
   - Basic shape drawing (triangle, circle, polygon)
4. Add FPS counter for performance monitoring

**Tests:**
```typescript
// tests/unit/core/GameEngine.test.ts
- Game loop starts and stops correctly
- Delta time calculations are accurate
- Fixed timestep update called at 60 FPS

// tests/unit/core/Renderer.test.ts
- Canvas context initialized correctly
- Screen clears properly
- Shapes render at correct positions
```

**Validation:**
- Canvas renders on screen
- FPS counter shows ~60 FPS
- Game loop runs smoothly

---

### Day 3-4: Input System & Player Movement

**Files to create:**
- [ ] `src/core/InputManager.ts` - Touch/mouse input handling
- [ ] `src/entities/GameObject.ts` - Base entity class
- [ ] `src/entities/Player.ts` - Player entity
- [ ] `src/utils/math.ts` - Math helper functions

**Tasks:**
1. Implement InputManager:
   - Touch event listeners (touchstart, touchmove, touchend)
   - Mouse fallback for desktop testing
   - Coordinate conversion (screen to canvas)
   - Event debouncing
2. Create GameObject base class with:
   - position, velocity, rotation
   - update() and render() methods
3. Implement Player class:
   - Triangle sprite rendering
   - Constant velocity movement to touch point
   - Target position tracking
4. Connect input to player movement

**Tests:**
```typescript
// tests/unit/core/InputManager.test.ts
- Touch events converted to canvas coordinates
- Mouse events work as fallback
- Multiple touches handled correctly

// tests/unit/entities/Player.test.ts
- Player moves toward target position
- Movement stops when target reached
- Movement speed is constant
```

**Validation:**
- Click/touch on canvas
- Player triangle moves to clicked position
- Movement is smooth and constant speed

---

### Day 4-5: Player Shooting

**Files to create:**
- [ ] `src/entities/Bullet.ts` - Bullet entity
- [ ] `src/core/ObjectPool.ts` - Object pooling system

**Tasks:**
1. Implement Bullet class:
   - Circle sprite rendering
   - Upward movement with acceleration
   - Lifetime tracking
2. Create ObjectPool for bullet reuse
3. Add firing mechanism to Player:
   - Fire on touch
   - Fire rate limiting (prevent spam)
   - Bullet size from player state
4. Update GameEngine to manage bullets array

**Tests:**
```typescript
// tests/unit/entities/Bullet.test.ts
- Bullet moves upward
- Velocity increases over time
- Bullet deactivates when off-screen

// tests/unit/core/ObjectPool.test.ts
- Objects are reused correctly
- Pool grows when needed
- Released objects are reset

// tests/unit/entities/Player.test.ts
- Player fires bullet on touch
- Fire rate is limited
- Bullet inherits player's bullet size
```

**Validation:**
- Touch canvas
- Player fires circular bullet upward
- Bullet accelerates as it moves
- Bullets are reused (check pool size in console)

---

## Phase 2: Enemies & Basic Collision (Week 1-2)

### Day 6-7: Enemy Entity & Basic Physics

**Files to create:**
- [ ] `src/entities/Enemy.ts` - Enemy entity
- [ ] `src/core/PhysicsEngine.ts` - Physics system
- [ ] `src/utils/random.ts` - Random number utilities

**Tasks:**
1. Implement Enemy class:
   - Polygon rendering (4-8 sides)
   - Basic downward movement (temporary, before Bezier)
   - Size based on side count
2. Create PhysicsEngine:
   - Update positions based on velocities
   - Boundary checking
   - Simple gravity/acceleration
3. Add enemy spawning to GameEngine
4. Create utility functions for random generation

**Tests:**
```typescript
// tests/unit/entities/Enemy.test.ts
- Enemy renders correct polygon shape
- Different polygons for different side counts
- Enemy moves downward

// tests/unit/core/PhysicsEngine.test.ts
- Positions update correctly
- Velocity applied to position
- Off-screen detection works
```

**Validation:**
- Enemies spawn at top of screen
- Enemies move downward (straight line for now)
- Different polygon shapes visible (4, 5, 6, 7, 8 sides)

---

### Day 7-8: Basic Collision Detection

**Files to create:**
- [ ] `src/geometry/collision.ts` - Collision algorithms
- [ ] `src/core/CollisionDetector.ts` - Collision system

**Tasks:**
1. Implement collision.ts with:
   - Circle-circle collision
   - Point-in-polygon (ray casting)
   - Bounding box overlap
2. Create CollisionDetector:
   - Check all bullet-enemy pairs
   - Check all player-enemy pairs
   - Collision response (destroy both for bullet-enemy)
3. Add collision handling to GameEngine

**Tests:**
```typescript
// tests/unit/geometry/collision.test.ts
- Circle collision detected correctly
- No false positives for separated circles
- Point-in-polygon works for various shapes
- Edge cases (touching, overlapping)

// tests/integration/collision-system.test.ts
- Bullet destroys enemy on hit
- Player takes damage on enemy hit
- Both entities removed after collision
```

**Validation:**
- Shoot bullets at enemies
- Bullets and enemies disappear on collision
- Player triangle flickers/changes when hit by enemy

---

## Phase 3: Bezier Curves & Advanced Movement (Week 2)

### Day 8-9: Bezier Curve Implementation

**Files to create:**
- [ ] `src/geometry/BezierCurve.ts` - Bezier curve class
- [ ] `src/geometry/Polygon.ts` - Polygon utilities

**Tasks:**
1. Implement BezierCurve class:
   - De Casteljau's algorithm for point calculation
   - Tangent calculation for rotation
   - Curve validation
2. Create control point generation:
   - n points for n-sided polygon
   - Start at top, end at bottom
   - Smooth distribution with random offsets
3. Add curve visualization for debugging

**Tests:**
```typescript
// tests/unit/geometry/BezierCurve.test.ts
- Point at t=0 is first control point
- Point at t=1 is last control point
- Points between 0 and 1 are on curve
- Tangent calculation is correct
- Works with 4-8 control points

// tests/unit/geometry/BezierCurve.test.ts (visual tests)
- Curve stays within screen bounds
- Curve is smooth (no sharp angles)
```

**Validation:**
- Render Bezier curves on screen
- Verify smooth, natural-looking paths
- Test with different numbers of control points

---

### Day 9-10: Enemy Path Following

**Files to create:**
- [ ] Update `src/entities/Enemy.ts` with path following

**Tasks:**
1. Update Enemy class:
   - Generate Bezier curve on spawn
   - Track progress along curve (0 to 1)
   - Update position from curve.getPoint(progress)
   - Rotate to face direction of travel
2. Remove basic downward movement
3. Add path visualization toggle for debugging

**Tests:**
```typescript
// tests/unit/entities/Enemy.test.ts
- Enemy follows curve path
- Enemy rotation matches movement direction
- Enemy deactivates at path end
- Path progress increases over time

// tests/integration/enemy-movement.test.ts
- Multiple enemies follow different paths
- Enemies don't collide with each other
- Paths look natural and varied
```

**Validation:**
- Enemies follow smooth curved paths
- Enemies rotate to face movement direction
- Different enemies have different paths
- Paths look natural (not too wild)

---

## Phase 4: Wave System & Power-ups (Week 2-3)

### Day 11-12: Wave Management

**Files to create:**
- [ ] `src/systems/WaveManager.ts` - Wave generation
- [ ] `src/systems/ScoreManager.ts` - Score tracking

**Tasks:**
1. Implement WaveManager:
   - Generate wave configurations
   - Spawn enemies with delays
   - Detect wave completion
   - Progressive difficulty
2. Create ScoreManager:
   - Track current score
   - Different points for different enemies
   - High score persistence
3. Add wave UI (wave number display)

**Tests:**
```typescript
// tests/unit/systems/WaveManager.test.ts
- Waves generate 4-8 enemies
- Enemy count increases with wave number
- Difficulty scales appropriately
- Wave completes when all enemies destroyed

// tests/unit/systems/ScoreManager.test.ts
- Score increases on enemy destruction
- Different enemies worth different points
- High score saves to localStorage
```

**Validation:**
- Wave 1 starts with 4 enemies
- After destroying all enemies, wave 2 starts
- Later waves have more enemies
- Score increases when enemies destroyed

---

### Day 12-13: Power-up System

**Files to create:**
- [ ] `src/entities/PowerUp.ts` - Power-up entity
- [ ] `src/systems/PowerUpSystem.ts` - Power-up management

**Tasks:**
1. Implement PowerUp entity:
   - Diamond sprite rendering
   - Downward falling movement
   - Collection detection
2. Create PowerUpSystem:
   - Spawn diamond on wave completion
   - Handle bullet size calculation (area-based)
   - Cap at 4x base area
3. Update Player to track bullet size
4. Update Bullet to use player's bullet size

**Tests:**
```typescript
// tests/unit/entities/PowerUp.test.ts
- PowerUp falls downward
- Collection detection works
- PowerUp deactivates when collected

// tests/unit/systems/PowerUpSystem.test.ts
- Diamond spawns on wave complete
- Bullet area increases by 10%
- Bullet size caps at 4x area
- Formula: newRadius = sqrt((currentArea + 0.1 * baseArea) / PI)

// tests/integration/powerup-collection.test.ts
- Collecting diamond increases bullet size
- Bullets render at new size
- Multiple collections accumulate
- Cap is enforced correctly
```

**Validation:**
- Complete wave 1
- Diamond appears and falls
- Collect diamond (player touches it)
- Next bullets are visibly larger
- After many diamonds, bullets cap at 4x size

---

### Day 13-14: Advanced Collision & Polish

**Files to create:**
- [ ] Update `src/core/CollisionDetector.ts` with spatial partitioning
- [ ] Update `src/geometry/collision.ts` with SAT

**Tasks:**
1. Implement spatial partitioning:
   - Grid-based collision detection
   - Divide screen into cells
   - Only check nearby entities
2. Add SAT for polygon-polygon collision
3. Optimize collision checking
4. Add visual feedback for collisions

**Tests:**
```typescript
// tests/unit/core/CollisionDetector.test.ts (performance)
- Grid partitioning reduces checks
- Only nearby entities checked
- Performance with 100+ entities

// tests/unit/geometry/collision.test.ts (SAT)
- Polygon-polygon collision works
- Works with all polygon combinations
- Accurate for rotated polygons
```

**Validation:**
- Game runs smoothly with 50+ entities
- Collisions are accurate
- No missed collisions
- No false positives

---

## Phase 5: Editor Mode (Week 3)

### Day 15-16: Editor Foundation

**Files to create:**
- [ ] `src/editor/SpriteEditor.ts` - Editor logic
- [ ] `src/editor/EditorCanvas.ts` - Editor canvas
- [ ] `src/editor/EditorUI.ts` - Editor UI
- [ ] `src/types/editor.ts` - Editor types

**Tasks:**
1. Create editor mode toggle
2. Implement EditorCanvas:
   - Separate canvas for editing
   - Polygon outline rendering
   - Grid or guides
3. Create EditorUI:
   - Shape selector (4-8 sides)
   - Color picker
   - Brush size selector
   - Save/Reset buttons
4. Basic mode switching (game ↔ editor)

**Tests:**
```typescript
// tests/unit/editor/SpriteEditor.test.ts
- Editor initializes correctly
- Shape selection works
- UI elements render
- Mode switching preserves game state
```

**Validation:**
- Click "Editor" button
- See editor canvas
- Select different polygon shapes
- Shapes render on canvas

---

### Day 16-17: Paint Tool Implementation

**Files to create:**
- [ ] Update `src/editor/SpriteEditor.ts` with painting

**Tasks:**
1. Implement painting system:
   - Touch/mouse drawing
   - Brush stroke rendering
   - Color application
   - Smooth brush movement
2. Add undo/redo (optional, but recommended)
3. Add clear/reset functionality
4. Paint only within polygon bounds

**Tests:**
```typescript
// tests/unit/editor/SpriteEditor.test.ts
- Drawing creates marks on canvas
- Brush size affects stroke width
- Color changes work
- Reset clears canvas
- Paint only inside polygon

// tests/e2e/editor.spec.ts
- User can draw on sprite
- Different colors work
- Brush sizes work
- Reset clears drawing
```

**Validation:**
- Select polygon shape
- Draw on it with touch/mouse
- Change colors
- Change brush size
- Reset and verify it clears

---

### Day 17-18: Sprite Storage & Loading

**Files to create:**
- [ ] `src/storage/StorageManager.ts` - localStorage management

**Tasks:**
1. Implement StorageManager:
   - Save ImageData to localStorage (base64)
   - Load ImageData from localStorage
   - Separate storage for each polygon type
   - Handle storage quota errors
2. Connect editor save button
3. Load custom sprites in game
4. Fallback to default polygon if no custom sprite

**Tests:**
```typescript
// tests/unit/storage/StorageManager.test.ts
- Sprite saves to localStorage
- Sprite loads from localStorage
- Different shapes stored separately
- Storage errors handled gracefully
- ImageData converted correctly

// tests/integration/editor.test.ts
- Custom sprite used in game
- Different enemies use correct custom sprites
- Default used when no custom sprite
```

**Validation:**
- Draw custom sprite
- Save it
- Return to game mode
- See custom sprite on enemies
- Refresh page, verify sprite persists

---

## Phase 6: UI & Polish (Week 4)

### Day 19-20: Menu System & HUD

**Files to create:**
- [ ] `src/ui/MenuScreen.ts` - Main menu
- [ ] `src/ui/HUD.ts` - In-game HUD
- [ ] `src/ui/GameOverScreen.ts` - Game over screen
- [ ] `src/ui/PauseScreen.ts` - Pause screen

**Tasks:**
1. Create MenuScreen:
   - Start Game button
   - Editor button
   - High score display
   - Instructions
2. Implement HUD:
   - Score display
   - Lives display
   - Wave number
   - Bullet size indicator
3. Create GameOverScreen:
   - Final score
   - High score
   - Retry button
4. Add PauseScreen (optional)

**Tests:**
```typescript
// tests/e2e/menu.spec.ts
- Menu displays on load
- Start button begins game
- Editor button opens editor
- High score displays correctly

// tests/integration/hud.test.ts
- HUD updates when score changes
- Lives display updates on damage
- Wave number increments
```

**Validation:**
- Game loads to menu
- All buttons work
- HUD displays during gameplay
- Game over screen shows after death
- Can restart from game over

---

### Day 20-21: Visual Effects

**Files to create:**
- [ ] `src/entities/Particle.ts` - Particle entity
- [ ] `src/systems/ParticleSystem.ts` - Particle management

**Tasks:**
1. Implement Particle entity:
   - Small circle/shape
   - Velocity and lifetime
   - Fade out over time
2. Create ParticleSystem:
   - Spawn particles on events
   - Update and render particles
   - Pool particles for performance
3. Add particle effects for:
   - Enemy destruction (explosion)
   - Bullet collision
   - Player damage
   - Power-up collection

**Tests:**
```typescript
// tests/unit/entities/Particle.test.ts
- Particle fades over lifetime
- Particle deactivates after lifetime
- Particle moves correctly

// tests/unit/systems/ParticleSystem.test.ts
- Particles spawn on events
- Particle count managed
- Old particles recycled
```

**Validation:**
- Destroy enemy → explosion particles
- Collect power-up → sparkle particles
- Get hit → damage particles
- All effects look good

---

### Day 21-22: Audio & Final Polish

**Files to create:**
- [ ] `src/core/AudioManager.ts` - Sound system (optional)
- [ ] `public/assets/sounds/` - Sound files (optional)

**Tasks:**
1. Implement AudioManager (optional):
   - Web Audio API
   - Sound effect loading
   - Volume control
   - Sound on/off toggle
2. Add sound effects for:
   - Shooting
   - Enemy destruction
   - Power-up collection
   - Player damage
   - Game over
3. Polish existing features:
   - Smooth animations
   - Better visual feedback
   - Touch responsiveness
   - Performance optimization

**Tests:**
```typescript
// tests/unit/core/AudioManager.test.ts
- Sounds load correctly
- Volume control works
- Mute/unmute works

// tests/e2e/gameplay.spec.ts
- Full gameplay flow works
- All features integrated correctly
```

**Validation:**
- All features work together
- Game feels polished
- No bugs or glitches
- Smooth on mobile devices

---

## Phase 7: Testing & Optimization (Week 4)

### Day 23-24: Test Coverage

**Tasks:**
1. Review all untested code
2. Add missing unit tests
3. Add integration tests
4. Achieve >80% code coverage
5. Fix any bugs found during testing

**Tests:**
```typescript
// Ensure coverage for:
- All core systems (Engine, Renderer, Physics)
- All entities (Player, Enemy, Bullet, PowerUp)
- All utilities (math, geometry, collision)
- All edge cases
```

**Validation:**
- Run `npm run test:coverage`
- Coverage report shows >80%
- All critical paths tested

---

### Day 24-25: E2E Testing

**Files to create:**
- [ ] `tests/e2e/gameplay.spec.ts` - Full game flow
- [ ] `tests/e2e/editor.spec.ts` - Editor flow
- [ ] `tests/e2e/visual-regression.spec.ts` - Visual tests
- [ ] `tests/helpers/testUtils.ts` - Test utilities

**Tasks:**
1. Write E2E tests for:
   - Complete game session
   - Wave progression
   - Power-up collection
   - Game over and restart
   - Editor workflow
   - Custom sprite usage
2. Set up visual regression testing
3. Configure CI/CD pipeline

**Tests:**
```typescript
// tests/e2e/gameplay.spec.ts
- Automated game session (no user input)
- Touch simulation
- Score verification
- Wave progression

// tests/e2e/editor.spec.ts
- Complete editor workflow
- Save and load sprites

// tests/e2e/visual-regression.spec.ts
- Screenshot comparisons
- Render consistency
```

**Validation:**
- Run `npm run test:e2e`
- All E2E tests pass
- Tests run in headless mode
- CI/CD pipeline passes

---

### Day 25-26: Performance Optimization

**Tasks:**
1. Profile game with dev tools
2. Optimize hot paths:
   - Collision detection
   - Rendering
   - Physics updates
3. Implement optimizations:
   - Object pooling everywhere
   - Reduce garbage collection
   - Batch rendering
   - Culling off-screen entities
4. Test on low-end devices

**Validation:**
- Consistent 60 FPS
- No frame drops
- Low memory usage
- Smooth on mobile

---

### Day 26-27: Documentation & Cleanup

**Tasks:**
1. Add JSDoc comments to all public APIs
2. Update README with:
   - Getting started guide
   - Controls
   - Features
   - Screenshots
3. Clean up code:
   - Remove console.logs
   - Fix linter warnings
   - Remove dead code
4. Create deployment guide

**Validation:**
- All files have proper comments
- README is comprehensive
- No linter errors
- Code is clean and maintainable

---

## Post-Implementation

### Deployment Checklist

- [ ] Build passes: `npm run build`
- [ ] All tests pass: `npm test && npm run test:e2e`
- [ ] No linter errors: `npm run lint`
- [ ] README is complete
- [ ] TECHNICAL_PLAN.md is accurate
- [ ] Deploy to hosting (Vercel, Netlify, GitHub Pages)
- [ ] Test on real mobile devices
- [ ] Test on different browsers

### Future Enhancements (Optional)

See TECHNICAL_PLAN.md section 10 for ideas:
- Boss enemies
- Multiple player ships
- Online leaderboards
- Animation frames for sprites
- More power-up types

---

## Daily Development Workflow

1. **Start of day:**
   - Review previous day's work
   - Check off completed tasks
   - Plan today's tasks

2. **During development:**
   - Write tests first (TDD approach)
   - Implement feature
   - Verify tests pass
   - Manual testing in browser
   - Commit with descriptive message

3. **End of day:**
   - Run full test suite
   - Review code quality
   - Update this roadmap
   - Push to repository

## Tips for Success

1. **Test-Driven Development:** Write tests before implementation
2. **Incremental Progress:** Small, working increments
3. **Frequent Testing:** Test in browser constantly
4. **Mobile Testing:** Test on actual devices regularly
5. **Performance Monitoring:** Watch FPS counter
6. **Git Hygiene:** Commit often with clear messages
7. **Code Review:** Review your own code before committing
8. **Documentation:** Comment as you go

## When You Get Stuck

1. Review TECHNICAL_PLAN.md for algorithm details
2. Check existing tests for examples
3. Add console.logs to debug
4. Simplify the problem
5. Test in isolation
6. Take a break and come back fresh

---

Good luck with your implementation!
