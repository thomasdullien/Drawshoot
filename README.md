# Drawshoot - 2D Vertical Scrolling Shooter

A browser-based 2D vertical scrolling shooter game with touch controls and a custom sprite editor.

## Features

- Touch-optimized controls (tap to move and fire)
- Enemies follow Bezier curve paths
- Custom sprite editor for enemy designs
- Progressive difficulty with wave system
- Power-ups that enhance bullet size
- Local storage for custom sprites and high scores

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Building

```bash
npm run build
```

### Testing

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Project Structure

See [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) for comprehensive architecture documentation.

```
src/
├── core/           # Core game systems (engine, renderer, physics)
├── entities/       # Game objects (player, enemies, bullets)
├── systems/        # Game logic (waves, score, power-ups)
├── geometry/       # Math utilities (bezier curves, collision)
├── editor/         # Sprite editor
├── storage/        # Persistence layer
├── ui/             # UI components
├── utils/          # Helper functions
└── types/          # TypeScript type definitions
```

## Game Controls

### Gameplay
- **Touch/Click**: Move player to touch point and fire bullet
- **Multiple touches**: Player moves to most recent touch

### Editor
- **Select Shape**: Choose polygon sides (4-8)
- **Paint**: Touch and drag to draw on sprite
- **Save**: Store custom sprite to local storage
- **Reset**: Clear current sprite

## Technical Documentation

Comprehensive technical documentation is available in [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md), including:

1. High-level architecture
2. Technology choices
3. Key algorithms (Bezier curves, collision detection)
4. Data structures
5. Testing strategy
6. Implementation phases

## License

MIT
