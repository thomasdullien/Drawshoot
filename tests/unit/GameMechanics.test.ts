import { describe, it, expect } from 'vitest';
import { Player } from '../../src/entities/Player';
import { Bullet } from '../../src/entities/Bullet';
import { Enemy } from '../../src/entities/Enemy';
import { BezierCurve } from '../../src/geometry/BezierCurve';
import { Vector2D } from '../../src/geometry/Vector2D';
import { EnemyType } from '../../src/core/types';
import { CollisionDetection } from '../../src/geometry/CollisionDetection';

describe('Game Mechanics', () => {
  describe('Player', () => {
    it('should create player at specified position', () => {
      const pos = new Vector2D(100, 100);
      const player = new Player(pos, 30, 400, {
        maxEnergy: 100,
        shootCooldown: 100,
        energyDrainRate: 30,
        energyRecoveryRate: 10,
      });

      expect(player.position.x).toBe(100);
      expect(player.position.y).toBe(100);
      expect(player.energy).toBe(100);
    });

    it('should move toward target position', () => {
      const pos = new Vector2D(100, 100);
      const player = new Player(pos, 30, 400, {
        maxEnergy: 100,
        shootCooldown: 100,
        energyDrainRate: 30,
        energyRecoveryRate: 10,
      });

      player.setTarget(new Vector2D(200, 100));
      player.update(0.1); // 100ms

      // Should have moved closer to target
      expect(player.position.x).toBeGreaterThan(100);
      expect(player.position.x).toBeLessThan(200);
    });

    it('should drain energy when damaged', () => {
      const pos = new Vector2D(100, 100);
      const player = new Player(pos, 30, 400, {
        maxEnergy: 100,
        shootCooldown: 100,
        energyDrainRate: 30,
        energyRecoveryRate: 10,
      });

      player.drainEnergy(1); // 1 second
      expect(player.energy).toBe(70);
    });

    it('should become inactive when energy reaches zero', () => {
      const pos = new Vector2D(100, 100);
      const player = new Player(pos, 30, 400, {
        maxEnergy: 100,
        shootCooldown: 100,
        energyDrainRate: 30,
        energyRecoveryRate: 10,
      });

      player.drainEnergy(5); // 5 seconds
      expect(player.active).toBe(false);
    });
  });

  describe('Bullet', () => {
    it('should create bullet with initial velocity', () => {
      const bullet = new Bullet(new Vector2D(100, 100), 8, 400, 100);
      expect(bullet.speed).toBe(400);
      expect(bullet.velocity.y).toBeLessThan(0); // Moving upward (negative Y)
    });

    it('should accelerate over time', () => {
      const bullet = new Bullet(new Vector2D(100, 100), 8, 400, 100);
      const initialSpeed = bullet.speed;

      bullet.update(1); // 1 second

      expect(bullet.speed).toBeGreaterThan(initialSpeed);
    });

    it('should move upward', () => {
      const bullet = new Bullet(new Vector2D(100, 100), 8, 400, 100);
      const initialY = bullet.position.y;

      bullet.update(0.1); // 100ms

      expect(bullet.position.y).toBeLessThan(initialY);
    });

    it('should scale size with area multiplier', () => {
      const bullet = new Bullet(new Vector2D(100, 100), 8, 400, 100);
      const initialRadius = bullet.radius;

      bullet.setAreaMultiplier(4); // 4x area
      // Area = π * r^2, so radius should be sqrt(4) = 2x
      expect(bullet.radius).toBeCloseTo(initialRadius * 2, 2);
    });
  });

  describe('Enemy', () => {
    it('should create enemy with Bezier curve path', () => {
      const curve = BezierCurve.createRandom(4, 800, 1000, 5000);
      const enemy = new Enemy(EnemyType.SQUARE, 25, curve);

      expect(enemy.enemyType).toBe(EnemyType.SQUARE);
      expect(enemy.active).toBe(true);
    });

    it('should follow Bezier curve over time', () => {
      const points = [
        new Vector2D(100, 0),
        new Vector2D(100, 500),
        new Vector2D(100, 1000),
      ];
      const curve = new BezierCurve(points, 5000);
      const enemy = new Enemy(EnemyType.SQUARE, 25, curve);

      const initialY = enemy.position.y;
      enemy.update(1); // 1 second

      // Should have moved downward
      expect(enemy.position.y).toBeGreaterThan(initialY);
    });

    it('should become inactive when curve is complete', () => {
      const points = [new Vector2D(100, 0), new Vector2D(100, 100)];
      const curve = new BezierCurve(points, 1000);
      const enemy = new Enemy(EnemyType.SQUARE, 25, curve);

      enemy.update(2); // 2 seconds (beyond curve duration)

      expect(enemy.active).toBe(false);
    });
  });

  describe('Collision Detection', () => {
    it('should detect bullet-enemy collision', () => {
      const bullet = new Bullet(new Vector2D(100, 100), 8, 400, 100);
      const curve = BezierCurve.createRandom(4, 800, 1000, 5000);
      const enemy = new Enemy(EnemyType.SQUARE, 25, curve);

      // Position enemy at bullet location
      enemy.position.set(100, 100);
      enemy.vertices = [
        new Vector2D(90, 90),
        new Vector2D(110, 90),
        new Vector2D(110, 110),
        new Vector2D(90, 110),
      ];

      const collision = CollisionDetection.checkCollision(
        bullet,
        enemy,
        bullet.position,
        enemy.position
      );

      expect(collision).toBe(true);
    });

    it('should not detect collision when far apart', () => {
      const bullet = new Bullet(new Vector2D(100, 100), 8, 400, 100);
      const curve = BezierCurve.createRandom(4, 800, 1000, 5000);
      const enemy = new Enemy(EnemyType.SQUARE, 25, curve);

      enemy.position.set(500, 500);
      enemy.vertices = [
        new Vector2D(490, 490),
        new Vector2D(510, 490),
        new Vector2D(510, 510),
        new Vector2D(490, 510),
      ];

      const collision = CollisionDetection.checkCollision(
        bullet,
        enemy,
        bullet.position,
        enemy.position
      );

      expect(collision).toBe(false);
    });
  });
});
