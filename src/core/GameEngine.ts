import { GameState, GameMode, GameConfig } from './types';
import { Renderer } from './Renderer';
import { InputManager } from './InputManager';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { PowerUp } from '../entities/PowerUp';
import { CollisionSystem } from '../systems/CollisionSystem';
import { WaveManager } from '../systems/WaveManager';
import { PowerUpSystem } from '../systems/PowerUpSystem';
import { Vector2D } from '../geometry/Vector2D';

/**
 * Main game engine with fixed timestep game loop
 */
export class GameEngine {
  private renderer: Renderer;
  private inputManager: InputManager;
  private config: GameConfig;

  // Game state
  private gameState: GameState;

  // Entities
  private player: Player | null;
  private enemies: Enemy[];
  private bullets: Bullet[];
  private powerups: PowerUp[];

  // Systems
  private collisionSystem: CollisionSystem;
  private waveManager: WaveManager;
  private powerUpSystem: PowerUpSystem;

  // Game loop
  private isRunning: boolean;
  private lastTime: number;
  private accumulator: number;
  private readonly fixedDeltaTime: number = 1 / 60; // 60 FPS

  constructor(canvas: HTMLCanvasElement, config: GameConfig) {
    this.config = config;

    // Initialize renderer
    this.renderer = new Renderer(canvas, {
      width: config.canvas.width,
      height: config.canvas.height,
      backgroundColor: '#000033',
      showDebug: false,
    });

    // Initialize input
    this.inputManager = new InputManager(canvas);
    this.setupInputHandlers();

    // Initialize game state
    this.gameState = {
      mode: GameMode.PLAY,
      score: 0,
      lives: config.player.startLives,
      energy: config.player.maxEnergy,
      maxEnergy: config.player.maxEnergy,
      wave: 0,
      bulletSizeMultiplier: 1.0,
      isPaused: false,
      isGameOver: false,
    };

    // Initialize entities
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.powerups = [];

    // Initialize systems
    this.collisionSystem = new CollisionSystem();
    this.waveManager = new WaveManager(
      config.canvas.width,
      config.canvas.height,
      config.enemy.baseSize,
      {
        minEnemies: config.wave.minEnemies,
        maxEnemies: config.wave.maxEnemies,
        baseSpawnDelay: config.wave.baseSpawnDelay,
        spawnDelayReduction: config.wave.spawnDelayReduction,
      }
    );
    this.powerUpSystem = new PowerUpSystem(
      config.canvas.width,
      config.canvas.height,
      {
        size: config.powerup.size,
        fallSpeed: config.powerup.fallSpeed,
        lifetime: config.powerup.lifetime,
        maxSizeMultiplier: config.bullet.maxSizeMultiplier,
        sizeIncrement: config.bullet.sizeIncrement,
      }
    );

    // Game loop state
    this.isRunning = false;
    this.lastTime = 0;
    this.accumulator = 0;

    // Initialize game
    this.initializeGame();
  }

  /**
   * Initialize/reset the game
   */
  private initializeGame(): void {
    // Create player
    const playerStartPos = new Vector2D(
      this.config.canvas.width / 2,
      this.config.canvas.height - 100
    );

    this.player = new Player(playerStartPos, this.config.player.size, this.config.player.speed, {
      maxEnergy: this.config.player.maxEnergy,
      shootCooldown: this.config.player.shootCooldown,
      energyDrainRate: this.config.player.energyDrainRate,
      energyRecoveryRate: this.config.player.energyRecoveryRate,
    });

    // Reset state
    this.gameState.score = 0;
    this.gameState.lives = this.config.player.startLives;
    this.gameState.energy = this.config.player.maxEnergy;
    this.gameState.wave = 0;
    this.gameState.bulletSizeMultiplier = 1.0;
    this.gameState.isPaused = false;
    this.gameState.isGameOver = false;

    // Clear entities
    this.enemies = [];
    this.bullets = [];
    this.powerups = [];

    // Reset systems
    this.waveManager.reset();
    this.powerUpSystem.reset();

    // Start first wave
    this.waveManager.startWave();
    this.gameState.wave = this.waveManager.getCurrentWave();
  }

  /**
   * Setup input handlers
   */
  private setupInputHandlers(): void {
    this.inputManager.on('touchStart', (position?: Vector2D) => {
      if (this.gameState.isGameOver) {
        this.initializeGame();
        return;
      }

      if (this.player && position) {
        this.player.setTarget(position);
      }
    });

    this.inputManager.on('touchMove', (position?: Vector2D) => {
      if (this.player && !this.gameState.isGameOver && position) {
        this.player.setTarget(position);
      }
    });

    this.inputManager.on('touchEnd', () => {
      if (this.player) {
        this.player.setTarget(null);
      }
    });
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Main game loop with fixed timestep
   */
  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    // Calculate delta time
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Accumulate time
    this.accumulator += Math.min(deltaTime, 0.1); // Cap at 100ms to prevent spiral of death

    // Fixed timestep updates
    while (this.accumulator >= this.fixedDeltaTime) {
      if (!this.gameState.isPaused && !this.gameState.isGameOver) {
        this.update(this.fixedDeltaTime);
      }
      this.accumulator -= this.fixedDeltaTime;
    }

    // Render
    this.render();

    // Continue loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Update game state
   */
  private update(deltaTime: number): void {
    // Update player
    if (this.player) {
      this.player.update(deltaTime);

      // Shooting while touching
      if (this.inputManager.isTouching() && this.player.canShoot(performance.now())) {
        this.shoot();
        this.player.recordShot(performance.now());
      }

      // Update game state energy
      this.gameState.energy = this.player.energy;
    }

    // Update enemies
    this.enemies.forEach((enemy) => enemy.update(deltaTime));

    // Update bullets
    this.bullets.forEach((bullet) => bullet.update(deltaTime));

    // Update powerups
    this.powerups.forEach((powerup) => powerup.update(deltaTime));

    // Wave management
    const newEnemy = this.waveManager.update(deltaTime);
    if (newEnemy) {
      this.enemies.push(newEnemy);
    }

    // Collision detection
    if (this.player) {
      this.collisionSystem.checkPlayerEnemyCollisions(this.player, this.enemies, deltaTime);

      const collectedPowerUps = this.collisionSystem.checkPlayerPowerUpCollisions(
        this.player,
        this.powerups
      );

      collectedPowerUps.forEach(() => {
        if (this.powerUpSystem.applyPowerUp()) {
          this.gameState.bulletSizeMultiplier = this.powerUpSystem.getBulletSizeMultiplier();
          this.gameState.score += 100;
        }
      });
    }

    const { destroyedEnemies } = this.collisionSystem.checkBulletEnemyCollisions(
      this.bullets,
      this.enemies
    );

    // Award points for destroyed enemies
    destroyedEnemies.forEach(() => {
      this.gameState.score += 10;
    });

    // Check for wave completion
    const activeEnemies = this.enemies.filter((e) => e.active).length;
    if (this.waveManager.isWaveComplete(activeEnemies)) {
      // Spawn power-up
      const powerup = this.powerUpSystem.spawnPowerUpAtCenter();
      this.powerups.push(powerup);

      // Start next wave
      this.waveManager.startWave();
      this.gameState.wave = this.waveManager.getCurrentWave();
    }

    // Check if player lost a life
    if (this.player && !this.player.active) {
      this.gameState.lives--;

      if (this.gameState.lives > 0) {
        // Respawn player
        const playerStartPos = new Vector2D(
          this.config.canvas.width / 2,
          this.config.canvas.height - 100
        );

        this.player = new Player(playerStartPos, this.config.player.size, this.config.player.speed, {
          maxEnergy: this.config.player.maxEnergy,
          shootCooldown: this.config.player.shootCooldown,
          energyDrainRate: this.config.player.energyDrainRate,
          energyRecoveryRate: this.config.player.energyRecoveryRate,
        });

        this.player.makeInvulnerable(3000); // 3 seconds of invulnerability
        this.gameState.energy = this.player.energy;
      } else {
        // Game over
        this.gameState.isGameOver = true;
      }
    }

    // Cleanup inactive entities
    this.enemies = this.collisionSystem.cleanupInactive(this.enemies);
    this.bullets = this.collisionSystem.cleanupInactive(this.bullets);
    this.powerups = this.collisionSystem.cleanupInactive(this.powerups);

    // Remove bullets that are out of bounds
    this.bullets = this.bullets.filter(
      (bullet) => !bullet.isOutOfBounds(this.config.canvas.width, this.config.canvas.height)
    );
  }

  /**
   * Shoot a bullet
   */
  private shoot(): void {
    if (!this.player) return;

    const bulletPos = this.player.position.clone();
    const bullet = new Bullet(
      bulletPos,
      this.config.bullet.initialSize,
      this.config.bullet.speed,
      this.config.bullet.acceleration
    );

    // Apply current size multiplier
    bullet.setAreaMultiplier(this.gameState.bulletSizeMultiplier);

    this.bullets.push(bullet);
  }

  /**
   * Render the game
   */
  private render(): void {
    this.renderer.render(this.player, this.enemies, this.bullets, this.powerups, this.gameState);
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Get renderer
   */
  getRenderer(): Renderer {
    return this.renderer;
  }

  /**
   * Toggle pause
   */
  togglePause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stop();
    this.inputManager.destroy();
  }
}
