import { Vector2D } from '../geometry/Vector2D';

/**
 * Game modes
 */
export enum GameMode {
  PLAY = 'play',
  EDIT = 'edit',
}

/**
 * Entity types
 */
export enum EntityType {
  PLAYER = 'player',
  ENEMY = 'enemy',
  BULLET = 'bullet',
  POWERUP = 'powerup',
  PARTICLE = 'particle',
}

/**
 * Enemy types (polygon sides)
 */
export enum EnemyType {
  SQUARE = 4,
  PENTAGON = 5,
  HEXAGON = 6,
  HEPTAGON = 7,
  OCTAGON = 8,
}

/**
 * Base entity interface
 */
export interface IEntity {
  id: string;
  type: EntityType;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  active: boolean;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

/**
 * Collision component
 */
export interface ICollisionComponent {
  radius?: number; // For circle collision
  vertices?: Vector2D[]; // For polygon collision
  getBoundingBox(): { min: Vector2D; max: Vector2D };
}

/**
 * Game state
 */
export interface GameState {
  mode: GameMode;
  score: number;
  lives: number;
  energy: number;
  maxEnergy: number;
  wave: number;
  bulletSizeMultiplier: number; // Area multiplier (1.0 to 4.0)
  isPaused: boolean;
  isGameOver: boolean;
}

/**
 * Input state
 */
export interface InputState {
  isTouching: boolean;
  touchPosition: Vector2D | null;
  lastTouchPosition: Vector2D | null;
}

/**
 * Wave configuration
 */
export interface WaveConfig {
  waveNumber: number;
  enemyCount: number;
  enemyTypes: EnemyType[];
  spawnDelay: number; // Time between enemy spawns in ms
}

/**
 * Bezier curve configuration
 */
export interface BezierConfig {
  controlPoints: Vector2D[];
  duration: number; // Time to complete the curve in ms
}

/**
 * Custom sprite data for local storage
 */
export interface CustomSpriteData {
  type: EnemyType;
  imageData: string; // Base64 encoded image data
  timestamp: number;
}

/**
 * Collision result
 */
export interface CollisionResult {
  collided: boolean;
  normal?: Vector2D;
  penetration?: number;
}

/**
 * Renderer options
 */
export interface RendererOptions {
  width: number;
  height: number;
  backgroundColor: string;
  showDebug: boolean;
}

/**
 * Game configuration
 */
export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  player: {
    size: number;
    speed: number;
    startLives: number;
    maxEnergy: number;
    energyDrainRate: number; // Energy lost per second when touching enemy
    energyRecoveryRate: number; // Energy recovered per second
    shootCooldown: number; // Minimum time between shots in ms
  };
  bullet: {
    initialSize: number;
    speed: number;
    acceleration: number; // Linear acceleration upward
    maxSizeMultiplier: number; // Maximum area multiplier (4.0)
    sizeIncrement: number; // Area increase per power-up (0.1 = 10%)
  };
  enemy: {
    baseSize: number;
    spawnY: number; // Y position where enemies spawn
  };
  wave: {
    minEnemies: number;
    maxEnemies: number;
    baseSpawnDelay: number;
    spawnDelayReduction: number; // Reduced per wave
  };
  powerup: {
    size: number;
    fallSpeed: number;
    lifetime: number; // Time before power-up disappears in ms
  };
}
