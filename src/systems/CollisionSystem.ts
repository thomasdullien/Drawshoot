import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { PowerUp } from '../entities/PowerUp';
import { CollisionDetection } from '../geometry/CollisionDetection';

/**
 * System for handling all collision detection and resolution
 */
export class CollisionSystem {
  /**
   * Check and handle player-enemy collisions
   */
  checkPlayerEnemyCollisions(player: Player, enemies: Enemy[], deltaTime: number): void {
    if (!player.active) return;

    let isTouchingEnemy = false;

    for (const enemy of enemies) {
      if (!enemy.active) continue;

      // Broad phase: bounding box check
      const playerBox = player.getBoundingBox();
      const enemyBox = enemy.getBoundingBox();

      if (!CollisionDetection.boundingBoxOverlap(playerBox, enemyBox)) {
        continue;
      }

      // Narrow phase: precise collision
      const collision = CollisionDetection.checkCollision(
        player,
        enemy,
        player.position,
        enemy.position
      );

      if (collision) {
        isTouchingEnemy = true;
        break;
      }
    }

    // Drain energy if touching any enemy
    if (isTouchingEnemy) {
      player.drainEnergy(deltaTime);
    }
  }

  /**
   * Check and handle bullet-enemy collisions
   */
  checkBulletEnemyCollisions(bullets: Bullet[], enemies: Enemy[]): {
    destroyedEnemies: Enemy[];
    destroyedBullets: Bullet[];
  } {
    const destroyedEnemies: Enemy[] = [];
    const destroyedBullets: Bullet[] = [];

    for (const bullet of bullets) {
      if (!bullet.active) continue;

      for (const enemy of enemies) {
        if (!enemy.active) continue;

        // Broad phase
        const bulletBox = bullet.getBoundingBox();
        const enemyBox = enemy.getBoundingBox();

        if (!CollisionDetection.boundingBoxOverlap(bulletBox, enemyBox)) {
          continue;
        }

        // Narrow phase
        const collision = CollisionDetection.checkCollision(
          bullet,
          enemy,
          bullet.position,
          enemy.position
        );

        if (collision) {
          // Mark both for destruction
          bullet.active = false;
          enemy.active = false;

          destroyedBullets.push(bullet);
          destroyedEnemies.push(enemy);
          break; // Bullet can only hit one enemy
        }
      }
    }

    return { destroyedEnemies, destroyedBullets };
  }

  /**
   * Check and handle player-powerup collisions
   */
  checkPlayerPowerUpCollisions(player: Player, powerups: PowerUp[]): PowerUp[] {
    const collectedPowerUps: PowerUp[] = [];

    if (!player.active) return collectedPowerUps;

    for (const powerup of powerups) {
      if (!powerup.active) continue;

      // Check collision
      const collision = CollisionDetection.circleCircle(
        player.position,
        player.radius,
        powerup.position,
        powerup.radius
      );

      if (collision) {
        powerup.active = false;
        collectedPowerUps.push(powerup);
      }
    }

    return collectedPowerUps;
  }

  /**
   * Remove all inactive entities from arrays
   */
  cleanupInactive<T extends { active: boolean }>(entities: T[]): T[] {
    return entities.filter((e) => e.active);
  }
}
