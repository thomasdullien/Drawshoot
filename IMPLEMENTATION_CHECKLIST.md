# Implementation Checklist

Track your progress as you build Drawshoot. Check off items as you complete them.

## Setup Phase

- [ ] Read QUICK_START.md
- [ ] Read TECHNICAL_PLAN.md (at least sections 1-6)
- [ ] Skim IMPLEMENTATION_ROADMAP.md
- [ ] Bookmark ALGORITHM_REFERENCE.md
- [ ] Run `npm install`
- [ ] Run `npm run dev` - verify it works
- [ ] Run `npm test` - verify test setup works

## Phase 1: Core Foundation

### Basic Types & Structure
- [ ] Create `src/types/index.ts` with core interfaces
- [ ] Create `src/types/game.ts` with game types
- [ ] Create `src/geometry/Vector2.ts` class
- [ ] Create `src/config.ts` with game constants
- [ ] Write tests for Vector2

### Game Loop
- [ ] Create `public/index.html`
- [ ] Create `src/main.ts` entry point
- [ ] Create `src/core/GameEngine.ts`
- [ ] Implement requestAnimationFrame loop
- [ ] Implement fixed timestep (60 FPS)
- [ ] Add FPS counter
- [ ] Write tests for GameEngine

### Rendering
- [ ] Create `src/core/Renderer.ts`
- [ ] Initialize canvas context
- [ ] Implement clear screen
- [ ] Implement draw triangle (player)
- [ ] Implement draw circle (bullet)
- [ ] Implement draw polygon (enemy)
- [ ] Write tests for Renderer

### Input System
- [ ] Create `src/core/InputManager.ts`
- [ ] Handle touchstart events
- [ ] Handle touchmove events
- [ ] Handle touchend events
- [ ] Add mouse fallback
- [ ] Convert screen to canvas coordinates
- [ ] Write tests for InputManager

### Player Entity
- [ ] Create `src/entities/GameObject.ts` base class
- [ ] Create `src/entities/Player.ts`
- [ ] Implement triangle rendering
- [ ] Implement constant velocity movement
- [ ] Implement move-to-touch-point
- [ ] Write tests for Player movement

### Player Shooting
- [ ] Create `src/entities/Bullet.ts`
- [ ] Create `src/core/ObjectPool.ts`
- [ ] Implement bullet firing on touch
- [ ] Implement fire rate limiting
- [ ] Implement bullet acceleration
- [ ] Add bullet array to GameEngine
- [ ] Write tests for Bullet physics
- [ ] Write tests for ObjectPool

**Phase 1 Validation:**
- [ ] Player triangle visible on screen
- [ ] Touch/click moves player smoothly
- [ ] Bullets fire and accelerate upward
- [ ] Game runs at ~60 FPS

---

## Phase 2: Enemies & Basic Collision

### Enemy Entity
- [ ] Create `src/entities/Enemy.ts`
- [ ] Implement polygon rendering (4-8 sides)
- [ ] Create `src/utils/random.ts`
- [ ] Add basic downward movement (temporary)
- [ ] Add enemy spawning to GameEngine
- [ ] Write tests for Enemy

### Physics System
- [ ] Create `src/core/PhysicsEngine.ts`
- [ ] Implement position updates
- [ ] Implement velocity application
- [ ] Implement boundary checking
- [ ] Write tests for PhysicsEngine

### Basic Collision
- [ ] Create `src/geometry/collision.ts`
- [ ] Implement circle-circle collision
- [ ] Implement point-in-polygon
- [ ] Create `src/core/CollisionDetector.ts`
- [ ] Check bullet-enemy collisions
- [ ] Check player-enemy collisions
- [ ] Handle collision responses
- [ ] Write tests for collision algorithms
- [ ] Write integration tests for collision system

**Phase 2 Validation:**
- [ ] Enemies spawn and move downward
- [ ] Different polygon shapes visible
- [ ] Bullets destroy enemies on hit
- [ ] Player flickers/changes when hit
- [ ] Both bullet and enemy removed on collision

---

## Phase 3: Bezier Curves & Advanced Movement

### Bezier Implementation
- [ ] Create `src/geometry/BezierCurve.ts`
- [ ] Implement De Casteljau's algorithm
- [ ] Implement tangent calculation
- [ ] Implement control point generation
- [ ] Write tests for BezierCurve

### Polygon Utilities
- [ ] Create `src/geometry/Polygon.ts`
- [ ] Generate regular polygon points
- [ ] Calculate polygon bounds
- [ ] Write tests for Polygon

### Enemy Path Following
- [ ] Update Enemy with Bezier path
- [ ] Generate curve on enemy spawn
- [ ] Track progress along curve (0-1)
- [ ] Update position from curve
- [ ] Rotate to face movement direction
- [ ] Remove basic downward movement
- [ ] Write tests for path following

**Phase 3 Validation:**
- [ ] Enemies follow smooth curved paths
- [ ] Enemies rotate to face direction
- [ ] Different enemies have different paths
- [ ] Paths look natural and varied
- [ ] No enemies stuck or behaving oddly

---

## Phase 4: Wave System & Power-ups

### Wave Management
- [ ] Create `src/systems/WaveManager.ts`
- [ ] Generate wave configurations
- [ ] Implement progressive difficulty
- [ ] Spawn enemies with delays
- [ ] Detect wave completion
- [ ] Write tests for WaveManager

### Score System
- [ ] Create `src/systems/ScoreManager.ts`
- [ ] Track current score
- [ ] Different points per enemy type
- [ ] High score persistence
- [ ] Write tests for ScoreManager

### Power-up System
- [ ] Create `src/entities/PowerUp.ts`
- [ ] Create `src/systems/PowerUpSystem.ts`
- [ ] Implement diamond rendering
- [ ] Implement falling movement
- [ ] Spawn diamond on wave complete
- [ ] Implement area-based bullet scaling
- [ ] Cap bullet size at 4x
- [ ] Update Player with bullet size
- [ ] Update Bullet to use player size
- [ ] Write tests for PowerUp
- [ ] Write tests for PowerUpSystem
- [ ] Write integration tests

### Advanced Collision
- [ ] Implement spatial grid in CollisionDetector
- [ ] Implement SAT for polygon-polygon
- [ ] Optimize collision checking
- [ ] Write performance tests

**Phase 4 Validation:**
- [ ] Wave 1 starts with 4-8 enemies
- [ ] After destroying all, wave 2 starts
- [ ] Diamond appears on wave complete
- [ ] Collecting diamond increases bullet size
- [ ] Bullets visibly larger after power-ups
- [ ] Bullet size caps correctly
- [ ] Score increases when enemies destroyed
- [ ] Game runs smoothly with many entities

---

## Phase 5: Editor Mode

### Editor Foundation
- [ ] Create `src/types/editor.ts`
- [ ] Create `src/editor/SpriteEditor.ts`
- [ ] Create `src/editor/EditorCanvas.ts`
- [ ] Create `src/editor/EditorUI.ts`
- [ ] Add editor mode toggle to GameEngine
- [ ] Implement mode switching
- [ ] Write tests for editor setup

### Paint Tool
- [ ] Implement shape selector (4-8 sides)
- [ ] Render selected polygon outline
- [ ] Implement touch/mouse drawing
- [ ] Implement brush color picker
- [ ] Implement brush size selector
- [ ] Paint only within polygon bounds
- [ ] Add clear/reset button
- [ ] Write tests for paint tool

### Storage System
- [ ] Create `src/storage/StorageManager.ts`
- [ ] Save ImageData to localStorage
- [ ] Load ImageData from localStorage
- [ ] Handle storage quota errors
- [ ] Connect save button
- [ ] Load custom sprites in game
- [ ] Fallback to default if no custom sprite
- [ ] Write tests for StorageManager
- [ ] Write integration tests for editor

**Phase 5 Validation:**
- [ ] Can switch between game and editor
- [ ] Can select different polygon shapes
- [ ] Can draw on selected shape
- [ ] Can change colors
- [ ] Can change brush size
- [ ] Save button persists sprite
- [ ] Custom sprites appear on enemies in game
- [ ] Sprites persist after page refresh

---

## Phase 6: UI & Polish

### Menu System
- [ ] Create `src/ui/MenuScreen.ts`
- [ ] Add Start Game button
- [ ] Add Editor button
- [ ] Display high score
- [ ] Add instructions/controls
- [ ] Write tests for menu

### HUD (Heads-Up Display)
- [ ] Create `src/ui/HUD.ts`
- [ ] Display current score
- [ ] Display lives remaining
- [ ] Display wave number
- [ ] Display bullet size indicator
- [ ] Write tests for HUD

### Game Over Screen
- [ ] Create `src/ui/GameOverScreen.ts`
- [ ] Display final score
- [ ] Display high score
- [ ] Add retry button
- [ ] Add menu button
- [ ] Write tests for game over

### Particle Effects
- [ ] Create `src/entities/Particle.ts`
- [ ] Create `src/systems/ParticleSystem.ts`
- [ ] Add explosion on enemy death
- [ ] Add sparkles on power-up collection
- [ ] Add effects on player damage
- [ ] Implement particle pooling
- [ ] Write tests for particles

### Audio (Optional)
- [ ] Create `src/core/AudioManager.ts`
- [ ] Add shoot sound
- [ ] Add explosion sound
- [ ] Add power-up sound
- [ ] Add hit sound
- [ ] Add volume control
- [ ] Add mute toggle

**Phase 6 Validation:**
- [ ] Game loads to menu screen
- [ ] All menu buttons work
- [ ] HUD displays correctly during game
- [ ] HUD updates in real-time
- [ ] Game over screen appears on death
- [ ] Can restart from game over
- [ ] Particle effects look good
- [ ] Audio works (if implemented)

---

## Phase 7: Testing & Optimization

### Test Coverage
- [ ] Review all untested code
- [ ] Add missing unit tests
- [ ] Add missing integration tests
- [ ] Achieve >80% code coverage
- [ ] Fix bugs found during testing
- [ ] Run `npm run test:coverage` - verify >80%

### E2E Testing
- [ ] Create `tests/e2e/gameplay.spec.ts`
- [ ] Test complete game session
- [ ] Test wave progression
- [ ] Test power-up collection
- [ ] Test game over and restart
- [ ] Create `tests/e2e/editor.spec.ts`
- [ ] Test editor workflow
- [ ] Test sprite save/load
- [ ] Create `tests/e2e/visual-regression.spec.ts`
- [ ] Add screenshot tests
- [ ] Run `npm run test:e2e` - all pass

### Performance Optimization
- [ ] Profile with browser dev tools
- [ ] Optimize collision detection
- [ ] Optimize rendering
- [ ] Implement object pooling everywhere
- [ ] Add entity culling
- [ ] Batch render operations
- [ ] Test on low-end devices
- [ ] Achieve consistent 60 FPS

### Code Quality
- [ ] Add JSDoc comments to public APIs
- [ ] Remove console.logs
- [ ] Fix all ESLint warnings
- [ ] Run `npm run lint` - no errors
- [ ] Remove dead code
- [ ] Refactor complex functions

### Documentation
- [ ] Update README with screenshots
- [ ] Add getting started guide
- [ ] Document controls
- [ ] Add feature list
- [ ] Create deployment guide

**Phase 7 Validation:**
- [ ] All tests pass
- [ ] Code coverage >80%
- [ ] No linter errors
- [ ] Game runs at 60 FPS
- [ ] No memory leaks
- [ ] Works on mobile devices
- [ ] Documentation is complete

---

## Deployment

### Pre-Deployment
- [ ] Run `npm run build` - succeeds
- [ ] Run `npm test` - all pass
- [ ] Run `npm run test:e2e` - all pass
- [ ] Run `npm run lint` - no errors
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile Chrome
- [ ] Test on mobile Safari

### Deploy
- [ ] Choose hosting (Vercel/Netlify/GitHub Pages)
- [ ] Configure deployment
- [ ] Deploy production build
- [ ] Test deployed version
- [ ] Share with others!

### Post-Deployment
- [ ] Gather feedback
- [ ] Fix reported bugs
- [ ] Consider future enhancements

---

## Optional Enhancements

### Gameplay
- [ ] Boss enemies
- [ ] Multiple player ship types
- [ ] Different bullet patterns
- [ ] Combo system
- [ ] Screen shake effects
- [ ] Slow motion on near-misses

### Editor
- [ ] Undo/redo functionality
- [ ] Layer system
- [ ] Animation frames
- [ ] Import/export sprites
- [ ] Sprite gallery

### Social
- [ ] Online leaderboards
- [ ] Share custom sprites
- [ ] Challenge mode
- [ ] Achievements

### Visual
- [ ] Background parallax scrolling
- [ ] Trail effects
- [ ] Better particle systems
- [ ] Smooth camera shake
- [ ] Screen flash effects

---

## Milestone Celebrations

When you reach these milestones, take a moment to celebrate!

- [ ] 🎉 Player moves on screen
- [ ] 🎉 First bullet fired
- [ ] 🎉 First enemy destroyed
- [ ] 🎉 Enemy follows curved path
- [ ] 🎉 First wave completed
- [ ] 🎉 First power-up collected
- [ ] 🎉 Custom sprite works
- [ ] 🎉 First complete game session
- [ ] 🎉 All tests passing
- [ ] 🎉 Game deployed
- [ ] 🎉 PROJECT COMPLETE! 🚀

---

## Progress Tracking

**Start Date:** _______________

**Target Completion:** _______________

**Current Phase:** _______________

**Blockers/Notes:**
-
-
-

**Next Session Goals:**
1.
2.
3.

---

## Quick Reference

- Stuck? → Check ALGORITHM_REFERENCE.md
- What's next? → Check IMPLEMENTATION_ROADMAP.md
- Why this way? → Check TECHNICAL_PLAN.md
- How to start? → Check QUICK_START.md

**You've got this!** 💪
