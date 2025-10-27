import { EnemyType } from '../core/types';
import { LocalStorageManager } from '../storage/LocalStorage';

/**
 * Sprite editor for customizing enemy sprites
 */
export class SpriteEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentShape: EnemyType;
  private isDrawing: boolean;
  private currentColor: string;
  private brushSize: number;
  private initialized: boolean;

  // Drawing state
  private backgroundCanvas: HTMLCanvasElement;
  private backgroundCtx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Failed to get 2D context for editor');
    }
    this.ctx = ctx;

    this.currentShape = EnemyType.SQUARE;
    this.isDrawing = false;
    this.currentColor = '#FF0000';
    this.brushSize = 20;
    this.initialized = false;

    // Create background canvas for the default shape
    this.backgroundCanvas = document.createElement('canvas');
    this.backgroundCanvas.width = canvas.width;
    this.backgroundCanvas.height = canvas.height;

    const bgCtx = this.backgroundCanvas.getContext('2d');
    if (!bgCtx) {
      throw new Error('Failed to get 2D context for background canvas');
    }
    this.backgroundCtx = bgCtx;
  }

  /**
   * Initialize the editor
   */
  init(): void {
    if (this.initialized) return;

    this.setupEventListeners();
    this.setupUI();
    this.drawBackground();
    this.loadCustomSprite();

    this.initialized = true;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Setup event listeners for drawing
   */
  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
    this.canvas.addEventListener('touchcancel', this.stopDrawing.bind(this));
  }

  /**
   * Setup UI controls
   */
  private setupUI(): void {
    // Shape selector
    const shapeButtons = document.querySelectorAll('.shape-button');
    shapeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const shapeStr = (button as HTMLElement).dataset.shape;
        if (!shapeStr) return;
        const shape = parseInt(shapeStr);
        this.setShape(shape as EnemyType);

        // Update selected state
        shapeButtons.forEach((btn) => btn.classList.remove('selected'));
        button.classList.add('selected');
      });
    });

    // Select first shape by default
    if (shapeButtons.length > 0) {
      const firstButton = shapeButtons[0];
      if (firstButton) {
        firstButton.classList.add('selected');
      }
    }

    // Color picker
    const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
    if (colorPicker) {
      colorPicker.addEventListener('change', (e) => {
        this.currentColor = (e.target as HTMLInputElement).value;
      });
    }

    // Brush size
    const brushSize = document.getElementById('brushSize') as HTMLInputElement;
    const brushSizeValue = document.getElementById('brushSizeValue');
    if (brushSize && brushSizeValue) {
      brushSize.addEventListener('input', (e) => {
        this.brushSize = parseInt((e.target as HTMLInputElement).value);
        brushSizeValue.textContent = this.brushSize.toString();
      });
    }

    // Clear button
    const clearButton = document.getElementById('clearCanvas');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearCanvas();
      });
    }

    // Reset button
    const resetButton = document.getElementById('resetSprite');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.resetSprite();
      });
    }
  }

  /**
   * Set current shape
   */
  setShape(shape: EnemyType): void {
    this.currentShape = shape;
    this.drawBackground();
    this.loadCustomSprite();
  }

  /**
   * Draw the background shape (default polygon)
   */
  private drawBackground(): void {
    this.backgroundCtx.fillStyle = '#FFF';
    this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);

    // Draw polygon outline
    const centerX = this.backgroundCanvas.width / 2;
    const centerY = this.backgroundCanvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;

    this.backgroundCtx.beginPath();
    for (let i = 0; i < this.currentShape; i++) {
      const angle = (i / this.currentShape) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        this.backgroundCtx.moveTo(x, y);
      } else {
        this.backgroundCtx.lineTo(x, y);
      }
    }
    this.backgroundCtx.closePath();

    this.backgroundCtx.strokeStyle = '#CCC';
    this.backgroundCtx.lineWidth = 2;
    this.backgroundCtx.stroke();

    this.backgroundCtx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    this.backgroundCtx.fill();

    // Redraw main canvas
    this.redraw();
  }

  /**
   * Redraw the canvas (background + custom drawing)
   */
  private redraw(): void {
    // Copy background
    this.ctx.drawImage(this.backgroundCanvas, 0, 0);
  }

  /**
   * Start drawing
   */
  private startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.drawBrush(x, y);
  }

  /**
   * Draw
   */
  private draw(event: MouseEvent): void {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.drawBrush(x, y);
  }

  /**
   * Stop drawing
   */
  private stopDrawing(): void {
    this.isDrawing = false;
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.isDrawing = true;

    const rect = this.canvas.getBoundingClientRect();
    const touch = event.touches[0];
    if (!touch) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.drawBrush(x, y);
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const touch = event.touches[0];
    if (!touch) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.drawBrush(x, y);
  }

  /**
   * Draw brush at position
   */
  private drawBrush(x: number, y: number): void {
    this.ctx.fillStyle = this.currentColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Clear the canvas
   */
  clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground();
  }

  /**
   * Reset sprite to default
   */
  resetSprite(): void {
    LocalStorageManager.deleteCustomSprite(this.currentShape);
    this.clearCanvas();
  }

  /**
   * Save current sprite
   */
  saveCurrentSprite(): void {
    // Get canvas data as base64
    const dataURL = this.canvas.toDataURL('image/png');

    // Save to local storage
    LocalStorageManager.saveCustomSprite(this.currentShape, dataURL);

    console.log(`Saved custom sprite for ${this.currentShape}-sided polygon`);
  }

  /**
   * Load custom sprite from storage
   */
  private async loadCustomSprite(): Promise<void> {
    const spriteData = LocalStorageManager.getCustomSprite(this.currentShape);
    if (!spriteData) {
      this.clearCanvas();
      return;
    }

    try {
      // Load image from data URL
      const img = new Image();
      img.onload = () => {
        this.clearCanvas();
        this.ctx.drawImage(img, 0, 0);
      };
      img.src = spriteData.imageData;
    } catch (error) {
      console.error('Failed to load custom sprite:', error);
      this.clearCanvas();
    }
  }

  /**
   * Get current drawing as ImageBitmap
   */
  async getCurrentSpriteImage(): Promise<ImageBitmap | null> {
    try {
      return await createImageBitmap(this.canvas);
    } catch (error) {
      console.error('Failed to create ImageBitmap:', error);
      return null;
    }
  }
}
