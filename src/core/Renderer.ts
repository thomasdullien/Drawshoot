import { RendererOptions, GameState } from './types';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { PowerUp } from '../entities/PowerUp';

/**
 * Handles all rendering to the canvas
 */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: RendererOptions;

  constructor(canvas: HTMLCanvasElement, options: RendererOptions) {
    this.canvas = canvas;
    this.canvas.width = options.width;
    this.canvas.height = options.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    this.options = options;
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render the game state
   */
  render(
    player: Player | null,
    enemies: Enemy[],
    bullets: Bullet[],
    powerups: PowerUp[],
    gameState: GameState
  ): void {
    this.clear();

    // Render enemies
    enemies.forEach((enemy) => {
      if (this.options.showDebug) {
        enemy.renderPath(this.ctx);
      }
      enemy.render(this.ctx);
    });

    // Render bullets
    bullets.forEach((bullet) => bullet.render(this.ctx));

    // Render powerups
    powerups.forEach((powerup) => powerup.render(this.ctx));

    // Render player
    if (player) {
      player.render(this.ctx);
    }

    // Render UI
    this.renderUI(gameState);
  }

  /**
   * Render UI elements (health, score, etc.)
   */
  private renderUI(gameState: GameState): void {
    const margin = 20;
    const barHeight = 20;
    const barWidth = 200;

    // Energy bar
    this.ctx.save();

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(margin, margin, barWidth, barHeight);

    // Energy fill
    const energyPercent = gameState.energy / gameState.maxEnergy;
    const energyColor = energyPercent > 0.5 ? '#00FF00' : energyPercent > 0.25 ? '#FFFF00' : '#FF0000';

    this.ctx.fillStyle = energyColor;
    this.ctx.fillRect(margin, margin, barWidth * energyPercent, barHeight);

    // Border
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(margin, margin, barWidth, barHeight);

    // Energy text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('ENERGY', margin, margin + barHeight + 18);

    // Lives
    const livesY = margin + barHeight + 40;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText(`LIVES: ${gameState.lives}`, margin, livesY);

    // Score (top right)
    this.ctx.textAlign = 'right';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`SCORE: ${gameState.score}`, this.canvas.width - margin, margin + 20);

    // Wave (top right, below score)
    this.ctx.font = 'bold 18px Arial';
    this.ctx.fillText(`WAVE: ${gameState.wave}`, this.canvas.width - margin, margin + 50);

    // Bullet size multiplier indicator (bottom left)
    const multiplierY = this.canvas.height - margin - 30;
    this.ctx.textAlign = 'left';
    this.ctx.font = '14px Arial';

    const areaMultiplier = gameState.bulletSizeMultiplier;
    const multiplierPercent = ((areaMultiplier - 1) / (4 - 1)) * 100;

    this.ctx.fillStyle = '#00FFFF';
    this.ctx.fillText(
      `BULLET SIZE: ${areaMultiplier.toFixed(1)}x (${multiplierPercent.toFixed(0)}%)`,
      margin,
      multiplierY
    );

    // Bullet size progress bar
    const progressBarY = multiplierY + 10;
    const progressBarWidth = 150;
    const progressBarHeight = 8;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(margin, progressBarY, progressBarWidth, progressBarHeight);

    const progressFillWidth = progressBarWidth * ((areaMultiplier - 1) / (4 - 1));
    this.ctx.fillStyle = '#00FFFF';
    this.ctx.fillRect(margin, progressBarY, progressFillWidth, progressBarHeight);

    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(margin, progressBarY, progressBarWidth, progressBarHeight);

    // Game over text
    if (gameState.isGameOver) {
      this.ctx.textAlign = 'center';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.fillStyle = '#FF0000';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 4;

      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;

      this.ctx.strokeText('GAME OVER', centerX, centerY);
      this.ctx.fillText('GAME OVER', centerX, centerY);

      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText('Touch to restart', centerX, centerY + 50);
    }

    // Pause text
    if (gameState.isPaused && !gameState.isGameOver) {
      this.ctx.textAlign = 'center';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 4;

      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;

      this.ctx.strokeText('PAUSED', centerX, centerY);
      this.ctx.fillText('PAUSED', centerX, centerY);
    }

    this.ctx.restore();
  }

  /**
   * Render a message in the center of the screen
   */
  renderMessage(message: string, subtitle?: string): void {
    this.ctx.save();

    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.ctx.strokeText(message, centerX, centerY);
    this.ctx.fillText(message, centerX, centerY);

    if (subtitle) {
      this.ctx.font = 'bold 20px Arial';
      this.ctx.strokeText(subtitle, centerX, centerY + 40);
      this.ctx.fillText(subtitle, centerX, centerY + 40);
    }

    this.ctx.restore();
  }

  /**
   * Get canvas context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.options.width = width;
    this.options.height = height;
  }
}
