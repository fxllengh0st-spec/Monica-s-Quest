
import { GameSettings, Platform } from './types';

export const SETTINGS: GameSettings = {
  gravity: 1.2,
  jumpForce: -24,
  moveSpeed: 9,
  acceleration: 0.8,
  friction: 0.88,
  canvasWidth: 1024,
  canvasHeight: 512,
  levelLength: 6000,
  maxFallSpeed: 16,
};

export const COLORS = {
  MONICA: '#E52421',
  CEBOLINHA: '#22C55E',
  CASCAO: '#FACC15',
  SANSAO: '#4FACEF',
  GRASS: '#79da79',
  FENCE: '#b18e6e',
  BUILDING: '#a0a0a0',
  SKY: '#87CEEB',
  GROUND: '#d9c7a7',
  MELANCIA: '#EF4444',
  MELANCIA_GLOSS: '#BBF7D0',
};

export const LEVEL_PLATFORMS: Platform[] = [
  { x: 0, y: 400, w: 1000, h: 112, type: 'ground' },
  { x: 1150, y: 400, w: 1200, h: 112, type: 'ground' },
  { x: 2500, y: 400, w: 1500, h: 112, type: 'ground' },
  { x: 4200, y: 400, w: 2000, h: 112, type: 'ground' },
  
  { x: 400, y: 280, w: 150, h: 20, type: 'platform' },
  { x: 700, y: 220, w: 150, h: 20, type: 'platform' },
  { x: 1500, y: 280, w: 200, h: 20, type: 'platform' },
  { x: 1850, y: 200, w: 200, h: 20, type: 'platform' },
  { x: 2750, y: 280, w: 150, h: 20, type: 'platform' },
  { x: 3000, y: 180, w: 150, h: 20, type: 'platform' },
  { x: 5000, y: 280, w: 200, h: 20, type: 'platform' },
  { x: 5300, y: 200, w: 200, h: 20, type: 'platform' },
];

export const LEVEL_ENEMIES = [
  { x: 600, y: 340, type: 'cebolinha', patrolRange: 200 },
  { x: 1400, y: 340, type: 'cascao', patrolRange: 150 },
  { x: 2000, y: 140, type: 'cebolinha', patrolRange: 100 },
  { x: 2800, y: 340, type: 'cascao', patrolRange: 300 },
  { x: 3500, y: 340, type: 'cebolinha', patrolRange: 200 },
  { x: 4500, y: 340, type: 'cascao', patrolRange: 250 },
  { x: 5200, y: 340, type: 'cebolinha', patrolRange: 200 },
] as const;

export const LEVEL_COLLECTIBLES = [
  { x: 450, y: 230 },
  { x: 750, y: 170 },
  { x: 1250, y: 350 },
  { x: 1550, y: 230 },
  { x: 1900, y: 150 },
  { x: 2700, y: 350 },
  { x: 3050, y: 130 },
  { x: 4300, y: 350 },
  { x: 5100, y: 230 },
  { x: 5400, y: 150 },
] as const;
