
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  WON = 'WON',
  GAME_OVER = 'GAME_OVER'
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  pos: Vector2D;
  size: Vector2D;
  vel: Vector2D;
  color: string;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'ground' | 'platform' | 'obstacle';
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface GameSettings {
  gravity: number;
  jumpForce: number;
  moveSpeed: number;
  friction: number;
  canvasWidth: number;
  canvasHeight: number;
  levelLength: number;
}
