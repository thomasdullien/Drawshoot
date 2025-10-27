import { GameEngine } from './core/GameEngine';
import { GameConfig } from './core/types';
import { SpriteEditor } from './editor/SpriteEditor';

/**
 * Main application entry point
 */
class App {
  private gameEngine: GameEngine | null = null;
  private spriteEditor: SpriteEditor | null = null;
  private isEditorMode: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Get canvas
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    // Setup canvas size
    this.setupCanvas(canvas);

    // Create game configuration
    const config: GameConfig = {
      canvas: {
        width: canvas.width,
        height: canvas.height,
      },
      player: {
        size: 30,
        speed: 400, // pixels per second
        startLives: 3,
        maxEnergy: 100,
        energyDrainRate: 30, // per second when touching enemy
        energyRecoveryRate: 10, // per second
        shootCooldown: 100, // milliseconds
      },
      bullet: {
        initialSize: 8,
        speed: 400, // pixels per second
        acceleration: 100, // pixels per second^2
        maxSizeMultiplier: 4.0,
        sizeIncrement: 0.1,
      },
      enemy: {
        baseSize: 25,
        spawnY: 0,
      },
      wave: {
        minEnemies: 4,
        maxEnemies: 8,
        baseSpawnDelay: 2000, // milliseconds
        spawnDelayReduction: 100, // milliseconds per wave
      },
      powerup: {
        size: 20,
        fallSpeed: 50, // pixels per second
        lifetime: 10000, // milliseconds
      },
    };

    // Create game engine
    this.gameEngine = new GameEngine(canvas, config);

    // Create sprite editor
    const editorCanvas = document.getElementById('editorCanvas') as HTMLCanvasElement;
    this.spriteEditor = new SpriteEditor(editorCanvas);

    // Setup UI handlers
    this.setupUI();

    // Start game
    this.gameEngine.start();

    // Hide loading screen
    this.hideLoadingScreen();

    // Handle window resize
    window.addEventListener('resize', () => {
      this.setupCanvas(canvas);
    });
  }

  private setupCanvas(canvas: HTMLCanvasElement): void {
    // Set canvas size based on window size
    const maxWidth = Math.min(800, window.innerWidth - 20);
    const maxHeight = Math.min(1000, window.innerHeight - 80);

    // Maintain aspect ratio (4:5)
    const aspectRatio = 4 / 5;
    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    canvas.width = width;
    canvas.height = height;
  }

  private setupUI(): void {
    // Edit button
    const editButton = document.getElementById('editButton');
    if (editButton) {
      editButton.addEventListener('click', () => {
        this.toggleEditorMode();
      });
    }

    // Pause button
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
      pauseButton.addEventListener('click', () => {
        if (this.gameEngine) {
          this.gameEngine.togglePause();
          const isPaused = this.gameEngine.getGameState().isPaused;
          pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
        }
      });
    }

    // Restart button
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
      restartButton.addEventListener('click', () => {
        if (this.gameEngine) {
          this.gameEngine.destroy();
          const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

          const config: GameConfig = {
            canvas: {
              width: canvas.width,
              height: canvas.height,
            },
            player: {
              size: 30,
              speed: 400,
              startLives: 3,
              maxEnergy: 100,
              energyDrainRate: 30,
              energyRecoveryRate: 10,
              shootCooldown: 100,
            },
            bullet: {
              initialSize: 8,
              speed: 400,
              acceleration: 100,
              maxSizeMultiplier: 4.0,
              sizeIncrement: 0.1,
            },
            enemy: {
              baseSize: 25,
              spawnY: 0,
            },
            wave: {
              minEnemies: 4,
              maxEnemies: 8,
              baseSpawnDelay: 2000,
              spawnDelayReduction: 100,
            },
            powerup: {
              size: 20,
              fallSpeed: 50,
              lifetime: 10000,
            },
          };

          this.gameEngine = new GameEngine(canvas, config);
          this.gameEngine.start();

          if (pauseButton) {
            pauseButton.textContent = 'Pause';
          }
        }
      });
    }

    // Editor save button
    const saveButton = document.getElementById('saveSprite');
    if (saveButton && this.spriteEditor) {
      saveButton.addEventListener('click', () => {
        if (this.spriteEditor) {
          this.spriteEditor.saveCurrentSprite();
          this.toggleEditorMode();
        }
      });
    }
  }

  private toggleEditorMode(): void {
    this.isEditorMode = !this.isEditorMode;

    const editorMode = document.getElementById('editorMode');
    const editButton = document.getElementById('editButton');

    if (this.isEditorMode) {
      // Enter editor mode
      if (this.gameEngine) {
        this.gameEngine.togglePause();
      }

      if (editorMode) {
        editorMode.classList.add('active');
      }

      if (editButton) {
        editButton.textContent = 'Back to Game';
      }

      // Initialize editor if not already done
      if (this.spriteEditor && !this.spriteEditor.isInitialized()) {
        this.spriteEditor.init();
      }
    } else {
      // Exit editor mode
      if (this.gameEngine) {
        const isPaused = this.gameEngine.getGameState().isPaused;
        if (isPaused) {
          this.gameEngine.togglePause();
        }
      }

      if (editorMode) {
        editorMode.classList.remove('active');
      }

      if (editButton) {
        editButton.textContent = 'Edit Sprites';
      }
    }
  }

  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}
