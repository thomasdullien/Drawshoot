import { Enemy } from '../entities/Enemy';
import { EnemyType, WaveConfig } from '../core/types';
import { BezierCurve } from '../geometry/BezierCurve';

/**
 * Manages enemy waves and spawning
 */
export class WaveManager {
  private canvasWidth: number;
  private canvasHeight: number;
  private baseEnemySize: number;
  private currentWave: number;
  private enemiesInWave: number;
  private enemiesSpawned: number;
  private spawnTimer: number;
  private spawnDelay: number;
  private waveConfig: WaveConfig | null;
  private isSpawning: boolean;

  // Configuration
  private minEnemies: number;
  private maxEnemies: number;
  private baseSpawnDelay: number;
  private spawnDelayReduction: number;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    baseEnemySize: number,
    config: {
      minEnemies: number;
      maxEnemies: number;
      baseSpawnDelay: number;
      spawnDelayReduction: number;
    }
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.baseEnemySize = baseEnemySize;
    this.currentWave = 0;
    this.enemiesInWave = 0;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    this.spawnDelay = 0;
    this.waveConfig = null;
    this.isSpawning = false;

    this.minEnemies = config.minEnemies;
    this.maxEnemies = config.maxEnemies;
    this.baseSpawnDelay = config.baseSpawnDelay;
    this.spawnDelayReduction = config.spawnDelayReduction;
  }

  /**
   * Start a new wave
   */
  startWave(): void {
    this.currentWave++;
    this.waveConfig = this.generateWaveConfig(this.currentWave);
    this.enemiesInWave = this.waveConfig.enemyCount;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    this.spawnDelay = this.waveConfig.spawnDelay;
    this.isSpawning = true;
  }

  /**
   * Generate wave configuration based on wave number
   */
  private generateWaveConfig(waveNumber: number): WaveConfig {
    // Increase enemy count with each wave
    const enemyCount = Math.min(
      this.maxEnemies,
      this.minEnemies + Math.floor(waveNumber / 2)
    );

    // Reduce spawn delay as waves progress (but not below minimum)
    const spawnDelay = Math.max(
      500,
      this.baseSpawnDelay - waveNumber * this.spawnDelayReduction
    );

    // Generate random enemy types
    const enemyTypes: EnemyType[] = [];
    const availableTypes = [
      EnemyType.SQUARE,
      EnemyType.PENTAGON,
      EnemyType.HEXAGON,
      EnemyType.HEPTAGON,
      EnemyType.OCTAGON,
    ];

    // Higher waves include more complex enemy types
    const maxComplexity = Math.min(5, Math.floor(waveNumber / 2) + 1);
    const typePool = availableTypes.slice(0, maxComplexity);

    for (let i = 0; i < enemyCount; i++) {
      const randomType = typePool[Math.floor(Math.random() * typePool.length)];
      if (randomType) {
        enemyTypes.push(randomType);
      }
    }

    return {
      waveNumber,
      enemyCount,
      enemyTypes,
      spawnDelay,
    };
  }

  /**
   * Update wave spawning
   */
  update(deltaTime: number): Enemy | null {
    if (!this.isSpawning || !this.waveConfig) return null;

    this.spawnTimer += deltaTime * 1000;

    if (this.spawnTimer >= this.spawnDelay && this.enemiesSpawned < this.enemiesInWave) {
      this.spawnTimer = 0;

      // Spawn next enemy
      const enemyType = this.waveConfig.enemyTypes[this.enemiesSpawned];
      if (!enemyType) return null;

      const enemy = this.spawnEnemy(
        enemyType,
        this.currentWave
      );

      this.enemiesSpawned++;

      if (this.enemiesSpawned >= this.enemiesInWave) {
        this.isSpawning = false;
      }

      return enemy;
    }

    return null;
  }

  /**
   * Spawn a single enemy
   */
  private spawnEnemy(type: EnemyType, waveNumber: number): Enemy {
    // Increase curve duration slightly with wave number for more challenging patterns
    const baseDuration = 8000; // 8 seconds
    const duration = baseDuration + Math.random() * 4000; // 8-12 seconds

    // Create random Bezier curve with control points matching enemy type
    const curve = BezierCurve.createRandomEnhanced(
      type,
      this.canvasWidth,
      this.canvasHeight,
      duration
    );

    // Slightly increase enemy size with waves (but not too much)
    const sizeMultiplier = 1 + Math.min(0.5, waveNumber * 0.05);
    const enemySize = this.baseEnemySize * sizeMultiplier;

    return new Enemy(type, enemySize, curve);
  }

  /**
   * Check if current wave is complete (all enemies spawned and none active)
   */
  isWaveComplete(activeEnemies: number): boolean {
    return !this.isSpawning && activeEnemies === 0 && this.currentWave > 0;
  }

  /**
   * Check if currently spawning
   */
  isCurrentlySpawning(): boolean {
    return this.isSpawning;
  }

  /**
   * Get current wave number
   */
  getCurrentWave(): number {
    return this.currentWave;
  }

  /**
   * Get enemies spawned in current wave
   */
  getEnemiesSpawned(): number {
    return this.enemiesSpawned;
  }

  /**
   * Get total enemies in current wave
   */
  getTotalEnemiesInWave(): number {
    return this.enemiesInWave;
  }

  /**
   * Reset wave manager
   */
  reset(): void {
    this.currentWave = 0;
    this.enemiesInWave = 0;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    this.isSpawning = false;
    this.waveConfig = null;
  }
}
