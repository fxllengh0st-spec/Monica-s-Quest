
import { GameSettings, Platform } from './types';

export const SETTINGS: GameSettings = {
  gravity: 4.5,
  jumpForce: -40,
  moveSpeed: 12,
  friction: 0.1,
  canvasWidth: 1024,
  canvasHeight: 512, // Adjusted for SNES 2:1-ish feel
  levelLength: 6000,
};

export const COLORS = {
  MONICA: '#E52421',
  CEBOLINHA: '#22C55E',
  SANSAO: '#4FACEF',
  GRASS: '#79da79',
  FENCE: '#b18e6e',
  BUILDING: '#a0a0a0',
  SKY: '#87CEEB',
  GROUND: '#d9c7a7',
  BORDER_BLUE: '#1d4ed8',
};

export const LEVEL_PLATFORMS: Platform[] = [
  // Continuous ground for the main path
  { x: 0, y: 400, w: 1000, h: 112, type: 'ground' },
  { x: 1150, y: 400, w: 1200, h: 112, type: 'ground' },
  { x: 2500, y: 400, w: 1500, h: 112, type: 'ground' },
  { x: 4200, y: 400, w: 2000, h: 112, type: 'ground' },
  
  // Floating platforms (SNES style)
  { x: 400, y: 280, w: 150, h: 20, type: 'platform' },
  { x: 700, y: 220, w: 150, h: 20, type: 'platform' },
  { x: 1500, y: 280, w: 200, h: 20, type: 'platform' },
  { x: 1850, y: 200, w: 200, h: 20, type: 'platform' },
  { x: 2750, y: 280, w: 150, h: 20, type: 'platform' },
  { x: 3000, y: 180, w: 150, h: 20, type: 'platform' },
  { x: 5000, y: 280, w: 200, h: 20, type: 'platform' },
  { x: 5300, y: 200, w: 200, h: 20, type: 'platform' },
];
