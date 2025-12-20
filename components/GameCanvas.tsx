
import React, { useRef, useEffect, useState } from 'react';
import { Entity, Vector2D, InputState } from '../types';
import { SETTINGS, COLORS, LEVEL_PLATFORMS } from '../constants';
import { resolveCollisions, checkAABB } from '../engine/physics';

interface Props {
  onWin: () => void;
  onGameOver: () => void;
  onUpdateMetrics: (distance: number) => void;
  inputRef: React.MutableRefObject<InputState>;
}

const SPRITES = {
  WALK: 'https://c-p.rmcdn1.net/66904fdd8972c60017bb3017/4986599/Image-35bdf08a-22ef-4bd3-b27d-9c564b398d55.gif',
  JUMP: 'https://c-p.rmcdn1.net/66904fdd8972c60017bb3017/4986599/Image-d6a589c6-0900-44c0-b112-74e7cc768bf7.gif'
};

const GameCanvas: React.FC<Props> = ({ onWin, onGameOver, onUpdateMetrics, inputRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const walkSpriteRef = useRef<HTMLImageElement | null>(null);
  const jumpSpriteRef = useRef<HTMLImageElement | null>(null);
  const spritesLoadedRef = useRef<boolean>(false);

  // Ajuste na altura da caixa de colisão (size.y) para 68 
  const monicaRef = useRef<Entity>({
    pos: { x: 100, y: 300 },
    size: { x: 64, y: 68 }, 
    vel: { x: 0, y: 0 },
    color: COLORS.MONICA
  });
  
  const cebolinhaPos: Vector2D = { x: 5800, y: 300 };
  const cebolinhaSize: Vector2D = { x: 64, y: 80 };

  const cameraRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const isGroundedRef = useRef<boolean>(false);
  const facingRightRef = useRef<boolean>(true);

  // Separate image loading from the game loop effect
  useEffect(() => {
    let loadedCount = 0;
    const totalSprites = 2;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalSprites) {
        spritesLoadedRef.current = true;
      }
    };

    const walkImg = new Image();
    walkImg.src = SPRITES.WALK;
    walkImg.onload = onImageLoad;
    walkSpriteRef.current = walkImg;

    const jumpImg = new Image();
    jumpImg.src = SPRITES.JUMP;
    jumpImg.onload = onImageLoad;
    jumpSpriteRef.current = jumpImg;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') inputRef.current.jump = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') inputRef.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inputRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const monica = monicaRef.current;

      let targetVelX = 0;
      if (inputRef.current.left) {
        targetVelX -= SETTINGS.moveSpeed;
        facingRightRef.current = false;
      }
      if (inputRef.current.right) {
        targetVelX += SETTINGS.moveSpeed;
        facingRightRef.current = true;
      }
      
      monica.vel.x = targetVelX;
      monica.vel.y += SETTINGS.gravity;

      monica.pos.x += monica.vel.x;
      monica.pos.y += monica.vel.y;

      if (monica.pos.x < 0) monica.pos.x = 0;
      if (monica.pos.x > SETTINGS.levelLength) monica.pos.x = SETTINGS.levelLength;

      isGroundedRef.current = resolveCollisions(monica, LEVEL_PLATFORMS);

      if (inputRef.current.jump && isGroundedRef.current) {
        monica.vel.y = SETTINGS.jumpForce;
        isGroundedRef.current = false;
      }

      if (monica.pos.y > SETTINGS.canvasHeight) {
        onGameOver();
        return;
      }

      if (checkAABB(monica, { pos: cebolinhaPos, size: cebolinhaSize })) {
        onWin();
        return;
      }

      cameraRef.current = monica.pos.x - SETTINGS.canvasWidth / 3;
      if (cameraRef.current < 0) cameraRef.current = 0;
      if (cameraRef.current > SETTINGS.levelLength - SETTINGS.canvasWidth) {
        cameraRef.current = SETTINGS.levelLength - SETTINGS.canvasWidth;
      }

      onUpdateMetrics(Math.floor(monica.pos.x));

      // --- RENDERIZAÇÃO ---
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, SETTINGS.canvasWidth, SETTINGS.canvasHeight);
      
      // Sky
      ctx.fillStyle = COLORS.SKY;
      ctx.fillRect(0, 0, SETTINGS.canvasWidth, SETTINGS.canvasHeight);

      // Building silhouettes (Parallax)
      ctx.fillStyle = '#6ab8d6';
      for (let i = 0; i < 20; i++) {
        const bx = (i * 400 - cameraRef.current * 0.1) % 1200;
        ctx.fillRect(bx, 150, 80, 250);
        ctx.fillRect(bx + 40, 100, 120, 300);
        ctx.fillRect(bx + 120, 180, 60, 220);
      }

      // Fence (Parallax)
      ctx.fillStyle = COLORS.FENCE;
      const fenceWidth = 40;
      for (let i = 0; i < 60; i++) {
        const fx = (i * (fenceWidth + 4) - cameraRef.current * 0.8) % (SETTINGS.canvasWidth + 200);
        ctx.fillRect(fx, 340, fenceWidth, 60);
        ctx.fillStyle = '#8b6d51';
        ctx.fillRect(fx + 10, 350, 4, 4);
        ctx.fillRect(fx + 10, 380, 4, 4);
        ctx.fillRect(fx + 26, 350, 4, 4);
        ctx.fillRect(fx + 26, 380, 4, 4);
        ctx.fillStyle = COLORS.FENCE;
      }

      ctx.save();
      ctx.translate(-cameraRef.current, 0);
      
      // Platforms and Ground
      for (const p of LEVEL_PLATFORMS) {
        ctx.fillStyle = COLORS.GROUND;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = COLORS.GRASS;
        ctx.fillRect(p.x, p.y, p.w, 8);
        ctx.fillStyle = '#c7b494';
        for(let dx = 0; dx < p.w; dx += 50) {
            ctx.fillRect(p.x + dx + 10, p.y + 30, 8, 4);
        }
        if (p.type === 'ground') {
            const borderY = p.y + p.h - 32;
            ctx.fillStyle = COLORS.BORDER_BLUE;
            ctx.fillRect(p.x, borderY, p.w, 32);
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 4;
            for(let bx = 0; bx < p.w; bx += 32) {
                ctx.beginPath();
                ctx.arc(p.x + bx + 16, borderY + 16, 10, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
      }

      // Cebolinha
      const jiggle = Math.sin(Date.now() / 150) * 5;
      ctx.fillStyle = COLORS.CEBOLINHA;
      ctx.fillRect(cebolinhaPos.x, cebolinhaPos.y + jiggle, cebolinhaSize.x, cebolinhaSize.y);
      ctx.fillStyle = '#000';
      for(let h = 0; h < 5; h++) {
          ctx.fillRect(cebolinhaPos.x + 10 + (h * 10), cebolinhaPos.y + jiggle - 10, 2, 12);
      }
      ctx.fillStyle = COLORS.SANSAO;
      ctx.fillRect(cebolinhaPos.x + 30, cebolinhaPos.y + jiggle + 30, 40, 30);
      ctx.fillRect(cebolinhaPos.x + 40, cebolinhaPos.y + jiggle + 10, 8, 20);
      ctx.fillRect(cebolinhaPos.x + 55, cebolinhaPos.y + jiggle + 10, 8, 20);

      // Monica Sprite logic
      if (spritesLoadedRef.current) {
        const isJumping = !isGroundedRef.current || monica.vel.y !== 0;
        const currentSprite = isJumping ? jumpSpriteRef.current : walkSpriteRef.current;
        
        if (currentSprite) {
          ctx.save();
          const drawWidth = 64;
          const drawHeight = 80;
          const drawX = monica.pos.x;
          const drawY = monica.pos.y - (drawHeight - monica.size.y) + 4; 

          if (!facingRightRef.current) {
            ctx.translate(drawX + drawWidth, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(currentSprite, 0, 0, drawWidth, drawHeight);
          } else {
            ctx.drawImage(currentSprite, drawX, drawY, drawWidth, drawHeight);
          }
          ctx.restore();
        }
      } else {
        ctx.fillStyle = COLORS.MONICA;
        ctx.fillRect(monica.pos.x, monica.pos.y, monica.size.x, monica.size.y);
      }

      ctx.restore();
      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [onWin, onGameOver, onUpdateMetrics, inputRef]);

  return (
    <canvas 
      ref={canvasRef} 
      width={SETTINGS.canvasWidth} 
      height={SETTINGS.canvasHeight}
      className="w-full h-full border-b-8 border-black shadow-inner"
    />
  );
};

export default GameCanvas;
