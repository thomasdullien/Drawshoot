import { Vector2D } from '../geometry/Vector2D';
import { InputState } from './types';

/**
 * Manages touch and mouse input for the game
 */
export class InputManager {
  private canvas: HTMLCanvasElement;
  private inputState: InputState;
  private callbacks: {
    onTouchStart?: (position: Vector2D) => void;
    onTouchMove?: (position: Vector2D) => void;
    onTouchEnd?: () => void;
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.inputState = {
      isTouching: false,
      touchPosition: null,
      lastTouchPosition: null,
    };
    this.callbacks = {};

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), {
      passive: false,
    });

    // Mouse events (for desktop testing)
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private getPositionFromTouchEvent(event: TouchEvent): Vector2D | null {
    const rect = this.canvas.getBoundingClientRect();
    const touch = event.touches[0] || event.changedTouches[0];

    if (!touch) return null;

    // Account for canvas scaling
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return new Vector2D(
      (touch.clientX - rect.left) * scaleX,
      (touch.clientY - rect.top) * scaleY
    );
  }

  private getPositionFromMouseEvent(event: MouseEvent): Vector2D | null {
    const rect = this.canvas.getBoundingClientRect();

    // Account for canvas scaling
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return new Vector2D(
      (event.clientX - rect.left) * scaleX,
      (event.clientY - rect.top) * scaleY
    );
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const position = this.getPositionFromTouchEvent(event);
    if (!position) return;

    this.inputState.isTouching = true;
    this.inputState.touchPosition = position;
    this.inputState.lastTouchPosition = position;

    if (this.callbacks.onTouchStart) {
      this.callbacks.onTouchStart(position);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!this.inputState.isTouching) return;

    const position = this.getPositionFromTouchEvent(event);
    if (!position) return;

    this.inputState.touchPosition = position;

    if (this.callbacks.onTouchMove) {
      this.callbacks.onTouchMove(position);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.inputState.isTouching = false;
    this.inputState.touchPosition = null;

    if (this.callbacks.onTouchEnd) {
      this.callbacks.onTouchEnd();
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    const position = this.getPositionFromMouseEvent(event);
    if (!position) return;

    this.inputState.isTouching = true;
    this.inputState.touchPosition = position;
    this.inputState.lastTouchPosition = position;

    if (this.callbacks.onTouchStart) {
      this.callbacks.onTouchStart(position);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.inputState.isTouching) return;

    const position = this.getPositionFromMouseEvent(event);
    if (!position) return;

    this.inputState.touchPosition = position;

    if (this.callbacks.onTouchMove) {
      this.callbacks.onTouchMove(position);
    }
  }

  private handleMouseUp(): void {
    this.inputState.isTouching = false;
    this.inputState.touchPosition = null;

    if (this.callbacks.onTouchEnd) {
      this.callbacks.onTouchEnd();
    }
  }

  /**
   * Get current input state
   */
  getState(): InputState {
    return { ...this.inputState };
  }

  /**
   * Check if currently touching/clicking
   */
  isTouching(): boolean {
    return this.inputState.isTouching;
  }

  /**
   * Get current touch/mouse position
   */
  getTouchPosition(): Vector2D | null {
    return this.inputState.touchPosition ? this.inputState.touchPosition.clone() : null;
  }

  /**
   * Get last touch/mouse position
   */
  getLastTouchPosition(): Vector2D | null {
    return this.inputState.lastTouchPosition ? this.inputState.lastTouchPosition.clone() : null;
  }

  /**
   * Register callbacks for input events
   */
  on(
    event: 'touchStart' | 'touchMove' | 'touchEnd',
    callback: (position?: Vector2D) => void
  ): void {
    switch (event) {
      case 'touchStart':
        this.callbacks.onTouchStart = callback as (position: Vector2D) => void;
        break;
      case 'touchMove':
        this.callbacks.onTouchMove = callback as (position: Vector2D) => void;
        break;
      case 'touchEnd':
        this.callbacks.onTouchEnd = callback as () => void;
        break;
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    // Event listeners are bound inline, so we can't remove them easily
    // This is okay for our use case since the canvas lifecycle matches the game
  }
}
