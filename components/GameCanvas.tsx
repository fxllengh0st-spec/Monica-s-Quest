
import React, { useRef, useEffect } from 'react';
import { Entity, Vector2D, InputState, Particle } from '../types';
import { SETTINGS, COLORS, LEVEL_PLATFORMS } from '../constants';
import { resolveCollisions, checkAABB } from '../engine/physics';
import { SoundManager } from '../engine/adventure';

interface Props {
  onWin: () => void;
  onGameOver: () => void;
  onUpdateMetrics: (distance: number) => void;
  inputRef: React.MutableRefObject<InputState>;
}

const SPRITES = {
  WALK: 'https://c-p.rmcdn1.net/66904fdd8972c60017bb3017/4986599/Image-35bdf08a-22ef-4bd3-b27d-9c564b398d55.gif',
  JUMP: 'https://c-p.rmcdn1.net/66904fdd8972c60017bb3017/4986599/Image-d6a589c6-0900-44c0-b112-74e7cc768bf7.gif',
  BACKGROUND: 'assets/bg.webp'
};

const GameCanvas: React.FC<Props> = ({ onWin, onGameOver, onUpdateMetrics, inputRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const walkSpriteRef = useRef<HTMLImageElement | null>(null);
  const jumpSpriteRef = useRef<HTMLImageElement | null>(null);
  const backgroundSpriteRef = useRef<HTMLImageElement | null>(null);
  const spritesLoadedRef = useRef<boolean>(false);
  const soundManager = useRef<SoundManager | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  
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
  const lastTimeRef = useRef<number>(0);
  const isGroundedRef = useRef<boolean>(false);
  const facingRightRef = useRef<boolean>(true);

  useEffect(() => {
    soundManager.current = new SoundManager();
    
    let loadedCount = 0;
    const totalSprites = 3;
    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalSprites) spritesLoadedRef.current = true;
    };

    const walkImg = new Image();
    walkImg.src = SPRITES.WALK;
    walkImg.onload = onImageLoad;
    walkSpriteRef.current = walkImg;

    const jumpImg = new Image();
    jumpImg.src = SPRITES.JUMP;
    jumpImg.onload = onImageLoad;
    jumpSpriteRef.current = jumpImg;

    const bgImg = new Image();
    bgImg.src = SPRITES.BACKGROUND;
    bgImg.onload = onImageLoad;
    backgroundSpriteRef.current = bgImg;
  }, []);

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        pos: { x, y },
        size: { x: 4 + Math.random() * 4, y: 4 + Math.random() * 4 },
        vel: { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 },
        color,
        life: 1.0,
        maxLife: 1.0,
        opacity: 1.0
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 2); // Normalize to 60fps
      lastTimeRef.current = timestamp;

      const monica = monicaRef.current;

      // Movimentação
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
      monica.vel.y += SETTINGS.gravity * dt;

      monica.pos.x += monica.vel.x * dt;
      monica.pos.y += monica.vel.y * dt;

      if (monica.pos.x < 0) monica.pos.x = 0;
      if (monica.pos.x > SETTINGS.levelLength) monica.pos.x = SETTINGS.levelLength;

      const wasGrounded = isGroundedRef.current;
      isGroundedRef.current = resolveCollisions(monica, LEVEL_PLATFORMS);

      // Efeito de aterrissagem
      if (!wasGrounded && isGroundedRef.current) {
        createParticles(monica.pos.x + monica.size.x / 2, monica.pos.y + monica.size.y, '#fff', 5);
      }

      // Pulo
      if (inputRef.current.jump && isGroundedRef.current) {
        monica.vel.y = SETTINGS.jumpForce;
        isGroundedRef.current = false;
        soundManager.current?.jump();
        createParticles(monica.pos.x + monica.size.x / 2, monica.pos.y + monica.size.y, '#ddd', 8);
      }

      // Falecimento
      if (monica.pos.y > SETTINGS.canvasHeight) {
        soundManager.current?.hit();
        onGameOver();
        return;
      }

      // Vitória
      if (checkAABB(monica, { pos: cebolinhaPos, size: cebolinhaSize })) {
        soundManager.current?.coin();
        onWin();
        return;
      }

      // Câmera Suave
      const targetCamera = monica.pos.x - SETTINGS.canvasWidth / 3;
      cameraRef.current += (targetCamera - cameraRef.current) * 0.1 * dt;
      
      if (cameraRef.current < 0) cameraRef.current = 0;
      if (cameraRef.current > SETTINGS.levelLength - SETTINGS.canvasWidth) {
        cameraRef.current = SETTINGS.levelLength - SETTINGS.canvasWidth;
      }

      onUpdateMetrics(Math.floor(monica.pos.x));

      // --- RENDERIZAÇÃO ---
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, SETTINGS.canvasWidth, SETTINGS.canvasHeight);
      
      // Imagem de Fundo (Static)
      if (backgroundSpriteRef.current && backgroundSpriteRef.current.complete) {
        ctx.drawImage(backgroundSpriteRef.current, 0, 0, SETTINGS.canvasWidth, SETTINGS.canvasHeight);
      } else {
        // Fallback Sky
        ctx.fillStyle = COLORS.SKY;
        ctx.fillRect(0, 0, SETTINGS.canvasWidth, SETTINGS.canvasHeight);
      }

      ctx.save();
      ctx.translate(-cameraRef.current, 0);
      
      // Level
      for (const p of LEVEL_PLATFORMS) {
        ctx.fillStyle = COLORS.GROUND;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = COLORS.GRASS;
        ctx.fillRect(p.x, p.y, p.w, 8);
      }

      // Partículas
      particlesRef.current.forEach((p, index) => {
        p.pos.x += p.vel.x * dt;
        p.pos.y += p.vel.y * dt;
        p.life -= 0.02 * dt;
        if (p.life <= 0) {
          particlesRef.current.splice(index, 1);
        } else {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.pos.x, p.pos.y, p.size.x, p.size.y);
          ctx.globalAlpha = 1.0;
        }
      });

      // Cebolinha
      const jiggle = Math.sin(timestamp / 150) * 5;
      ctx.fillStyle = COLORS.CEBOLINHA;
      ctx.fillRect(cebolinhaPos.x, cebolinhaPos.y + jiggle, cebolinhaSize.x, cebolinhaSize.y);
      
      // Sansão
      ctx.fillStyle = COLORS.SANSAO;
      ctx.fillRect(cebolinhaPos.x + 30, cebolinhaPos.y + jiggle + 30, 40, 30);

      // Monica
      if (spritesLoadedRef.current) {
        const isJumping = !isGroundedRef.current || Math.abs(monica.vel.y) > 5;
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
