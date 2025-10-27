import { describe, it, expect } from 'vitest';
import { PowerUpSystem } from '../../src/systems/PowerUpSystem';
import { Vector2D } from '../../src/geometry/Vector2D';

describe('PowerUpSystem', () => {
  it('should initialize with default bullet size multiplier', () => {
    const system = new PowerUpSystem(800, 1000, {
      size: 20,
      fallSpeed: 50,
      lifetime: 10000,
      maxSizeMultiplier: 4.0,
      sizeIncrement: 0.1,
    });

    expect(system.getBulletSizeMultiplier()).toBe(1.0);
  });

  it('should increase bullet size when power-up is applied', () => {
    const system = new PowerUpSystem(800, 1000, {
      size: 20,
      fallSpeed: 50,
      lifetime: 10000,
      maxSizeMultiplier: 4.0,
      sizeIncrement: 0.1,
    });

    system.applyPowerUp();
    expect(system.getBulletSizeMultiplier()).toBeCloseTo(1.1, 5);
  });

  it('should not exceed max bullet size multiplier', () => {
    const system = new PowerUpSystem(800, 1000, {
      size: 20,
      fallSpeed: 50,
      lifetime: 10000,
      maxSizeMultiplier: 4.0,
      sizeIncrement: 0.1,
    });

    // Apply power-ups 50 times (should cap at 4.0)
    for (let i = 0; i < 50; i++) {
      system.applyPowerUp();
    }

    expect(system.getBulletSizeMultiplier()).toBe(4.0);
  });

  it('should spawn power-up at specified position', () => {
    const system = new PowerUpSystem(800, 1000, {
      size: 20,
      fallSpeed: 50,
      lifetime: 10000,
      maxSizeMultiplier: 4.0,
      sizeIncrement: 0.1,
    });

    const powerup = system.spawnPowerUp(new Vector2D(100, 100));
    expect(powerup.position.x).toBe(100);
    expect(powerup.position.y).toBe(100);
  });

  it('should reset bullet size multiplier', () => {
    const system = new PowerUpSystem(800, 1000, {
      size: 20,
      fallSpeed: 50,
      lifetime: 10000,
      maxSizeMultiplier: 4.0,
      sizeIncrement: 0.1,
    });

    system.applyPowerUp();
    system.applyPowerUp();
    expect(system.getBulletSizeMultiplier()).toBeCloseTo(1.2, 5);

    system.reset();
    expect(system.getBulletSizeMultiplier()).toBe(1.0);
  });
});
