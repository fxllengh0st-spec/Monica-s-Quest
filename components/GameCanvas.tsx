
import React, { useRef, useEffect } from 'react';
import { Entity, Vector2D, InputState, Particle, EnemyEntity, CollectibleEntity } from '../types';
import { SETTINGS, COLORS, LEVEL_PLATFORMS, LEVEL_ENEMIES, LEVEL_COLLECTIBLES } from '../constants';
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
  BACKGROUND: 'assets/bg.webp',
  CEBOLINHA: 'assets/3.gif',
  CASCAO: 'assets/c.webp',
  SANSAO: 'assets/s.png'
};

const GameCanvas: React.FC<Props> = ({ onWin, onGameOver, onUpdateMetrics, inputRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const walkSpriteRef = useRef<HTMLImageElement | null>(null);
  const jumpSpriteRef = useRef<HTMLImageElement | null>(null);
  const backgroundSpriteRef = useRef<HTMLImageElement | null>(null);
  const cebolinhaSpriteRef = useRef<HTMLImageElement | null>(null);
  const cascaoSpriteRef = useRef<HTMLImageElement | null>(null);
  const sansaoSpriteRef = useRef<HTMLImageElement | null>(null);
  
  const spritesLoadedRef = useRef<boolean>(false);
  const soundManager = useRef<SoundManager | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  const enemiesRef = useRef<EnemyEntity[]>(LEVEL_ENEMIES.map(e => ({
    pos: { x: e.x, y: e.y },
    size: { x: 48, y: 64 },
    vel: { x: 2, y: 0 },
    color: e.type === 'cebolinha' ? COLORS.CEBOLINHA : COLORS.CASCAO,
    type: e.type,
    startX: e.x,
    patrolRange: e.patrolRange,
    dir: 1,
    isDead: false
  })));

  const collectiblesRef = useRef<CollectibleEntity[]>(LEVEL_COLLECTIBLES.map(c => ({
    pos: { x: c.x, y: c.y },
    size: { x: 32, y: 32 },
    isCollected: false
  })));
  
  const monicaRef = useRef<Entity>({
    pos: { x: 100, y: 300 },
    size: { x: 64, y: 68 }, 
    vel: { x: 0, y: 0 },
    color: COLORS.MONICA
  });
  
  const cebolinhaVitoriaPos: Vector2D = { x: 5800, y: 300 };
  const cebolinhaSize: Vector2D = { x: 64, y: 80 };

  const cameraRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isGroundedRef = useRef<boolean>(false);
  const facingRightRef = useRef<boolean>(true);

  useEffect(() => {
    soundManager.current = new SoundManager();
    
    let loadedCount = 0;
    const totalSprites = 6;
    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalSprites) spritesLoadedRef.current = true;
    };
    
    const onImageError = (e: any) => {
      console.warn("Failed to load sprite:", e.target.src);
      onImageLoad(); 
    };

    const loadImage = (src: string, ref: React.MutableRefObject<HTMLImageElement | null>) => {
      const img = new Image();
      img.onload = onImageLoad;
      img.onerror = onImageError;
      img.src = src;
      ref.current = img;
    };

    loadImage(SPRITES.WALK, walkSpriteRef);
    loadImage(SPRITES.JUMP, jumpSpriteRef);
    loadImage(SPRITES.BACKGROUND, backgroundSpriteRef);
    loadImage(SPRITES.CEBOLINHA, cebolinhaSpriteRef);
    loadImage(SPRITES.CASCAO, cascaoSpriteRef);
    loadImage(SPRITES.SANSAO, sansaoSpriteRef);
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
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 2); 
      lastTimeRef.current = timestamp;

      const monica = monicaRef.current;
      const isGrounded = isGroundedRef.current;

      // --- FISICA ---
      const accel = isGrounded ? SETTINGS.acceleration : SETTINGS.acceleration * 0.5;
      const friction = isGrounded ? SETTINGS.friction : 0.98;

      if (inputRef.current.left) {
        monica.vel.x -= accel * dt;
        facingRightRef.current = false;
      } else if (inputRef.current.right) {
        monica.vel.x += accel * dt;
        facingRightRef.current = true;
      } else {
        monica.vel.x *= Math.pow(friction, dt);
        if (Math.abs(monica.vel.x) < 0.1) monica.vel.x = 0;
      }

      if (Math.abs(monica.vel.x) > SETTINGS.moveSpeed) {
        monica.vel.x = Math.sign(monica.vel.x) * SETTINGS.moveSpeed;
      }

      let currentGravity = SETTINGS.gravity;
      if (!inputRef.current.jump && monica.vel.y < 0) {
        currentGravity = SETTINGS.gravity * 2.5; 
      }

      monica.vel.y += currentGravity * dt;
      if (monica.vel.y > SETTINGS.maxFallSpeed) monica.vel.y = SETTINGS.maxFallSpeed;

      monica.pos.x += monica.vel.x * dt;
      monica.pos.y += monica.vel.y * dt;

      if (monica.pos.x < 0) monica.pos.x = 0;
      if (monica.pos.x > SETTINGS.levelLength) monica.pos.x = SETTINGS.levelLength;

      const wasGrounded = isGroundedRef.current;
      isGroundedRef.current = resolveCollisions(monica, LEVEL_PLATFORMS);

      if (!wasGrounded && isGroundedRef.current) {
        createParticles(monica.pos.x + monica.size.x / 2, monica.pos.y + monica.size.y, '#fff', 5);
      }

      if (inputRef.current.jump && isGroundedRef.current) {
        monica.vel.y = SETTINGS.jumpForce;
        isGroundedRef.current = false;
        soundManager.current?.jump();
        createParticles(monica.pos.x + monica.size.x / 2, monica.pos.y + monica.size.y, '#ddd', 8);
      }

      // --- INIMIGOS ---
      enemiesRef.current.forEach(enemy => {
        if (enemy.isDead) return;
        enemy.pos.x += enemy.vel.x * enemy.dir * dt;
        if (enemy.pos.x > enemy.startX + enemy.patrolRange) enemy.dir = -1;
        if (enemy.pos.x < enemy.startX - enemy.patrolRange) enemy.dir = 1;

        if (checkAABB(monica, enemy)) {
          if (monica.vel.y > 0 && monica.pos.y + monica.size.y < enemy.pos.y + enemy.size.y / 2) {
            enemy.isDead = true;
            monica.vel.y = SETTINGS.jumpForce * 0.7; 
            soundManager.current?.enemyDeath();
            createParticles(enemy.pos.x + enemy.size.x / 2, enemy.pos.y, enemy.color, 10);
          } else {
            soundManager.current?.hit();
            onGameOver();
          }
        }
      });

      // --- COLETÁVEIS ---
      collectiblesRef.current.forEach(c => {
        if (c.isCollected) return;
        if (checkAABB(monica, c)) {
          c.isCollected = true;
          soundManager.current?.coin();
          createParticles(c.pos.x + c.size.x / 2, c.pos.y + c.size.y / 2, COLORS.MELANCIA, 5);
        }
      });

      if (monica.pos.y > SETTINGS.canvasHeight) {
        soundManager.current?.hit();
        onGameOver();
        return;
      }

      if (checkAABB(monica, { pos: cebolinhaVitoriaPos, size: cebolinhaSize })) {
        soundManager.current?.coin();
        onWin();
        return;
      }

      const targetCamera = monica.pos.x - SETTINGS.canvasWidth / 3;
      cameraRef.current += (targetCamera - cameraRef.current) * 0.08 * dt;
      
      if (cameraRef.current < 0) cameraRef.current = 0;
      if (cameraRef.current > SETTINGS.levelLength - SETTINGS.canvasWidth) {
        cameraRef.current = SETTINGS.levelLength - SETTINGS.canvasWidth;
      }

      onUpdateMetrics(Math.floor(monica.pos.x));

      // --- RENDERIZAÇÃO ---
      ctx.imageSmoothingEnabled = false;
      // Limpa com transparência para ver o fundo do container
      ctx.clearRect(0, 0, SETTINGS.canvasWidth, SETTINGS.canvasHeight);
      
      // Parallax Background no Canvas (Apenas se carregado)
      if (backgroundSpriteRef.current && backgroundSpriteRef.current.complete && backgroundSpriteRef.current.naturalWidth > 0) {
        const bgWidth = SETTINGS.canvasWidth;
        const parallaxFactor = 0.5;
        const bgX = -(cameraRef.current * parallaxFactor) % bgWidth;
        
        ctx.drawImage(backgroundSpriteRef.current, bgX, 0, bgWidth, SETTINGS.canvasHeight);
        ctx.drawImage(backgroundSpriteRef.current, bgX + bgWidth, 0, bgWidth, SETTINGS.canvasHeight);
      }

      ctx.save();
      ctx.translate(-cameraRef.current, 0);
      
      // Plataformas
      for (const p of LEVEL_PLATFORMS) {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(p.x + 4, p.y + 4, p.w, p.h);
        ctx.fillStyle = COLORS.GROUND;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = COLORS.GRASS;
        ctx.fillRect(p.x, p.y, p.w, 12);
      }

      // Melancias
      collectiblesRef.current.forEach(c => {
        if (c.isCollected) return;
        const bob = Math.sin(timestamp / 200) * 8;
        ctx.fillStyle = '#166534';
        ctx.beginPath(); ctx.ellipse(c.pos.x + 16, c.pos.y + 16 + bob, 16, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = COLORS.MELANCIA;
        ctx.beginPath(); ctx.ellipse(c.pos.x + 16, c.pos.y + 16 + bob, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillRect(c.pos.x + 14, c.pos.y + 14 + bob, 2, 2); ctx.fillRect(c.pos.x + 18, c.pos.y + 17 + bob, 2, 2);
      });

      // Inimigos
      enemiesRef.current.forEach(e => {
        if (e.isDead) return;
        const enemySprite = e.type === 'cebolinha' ? cebolinhaSpriteRef.current : cascaoSpriteRef.current;
        if (enemySprite?.complete && enemySprite.naturalWidth > 0) {
            ctx.save();
            if (e.dir > 0) {
                ctx.translate(e.pos.x + e.size.x, e.pos.y);
                ctx.scale(-1, 1);
                ctx.drawImage(enemySprite, 0, 0, e.size.x, e.size.y);
            } else {
                ctx.drawImage(enemySprite, e.pos.x, e.pos.y, e.size.x, e.size.y);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = e.color;
            ctx.fillRect(e.pos.x, e.pos.y, e.size.x, e.size.y);
        }
      });

      // Partículas
      particlesRef.current.forEach((p, index) => {
        p.pos.x += p.vel.x * dt; p.pos.y += p.vel.y * dt;
        p.life -= 0.02 * dt;
        if (p.life <= 0) {
          particlesRef.current.splice(index, 1);
        } else {
          ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
          ctx.fillRect(p.pos.x, p.pos.y, p.size.x, p.size.y);
          ctx.globalAlpha = 1.0;
        }
      });

      // Cebolinha e Sansão (Objetivo Final)
      const jiggle = Math.sin(timestamp / 150) * 5;
      const cebX = cebolinhaVitoriaPos.x;
      const cebY = cebolinhaVitoriaPos.y + jiggle;
      
      if (cebolinhaSpriteRef.current?.complete && cebolinhaSpriteRef.current.naturalWidth > 0) {
          ctx.drawImage(cebolinhaSpriteRef.current, cebX, cebY, 64, 80);
      } else {
          ctx.fillStyle = COLORS.CEBOLINHA;
          ctx.fillRect(cebX, cebY, cebolinhaSize.x, cebolinhaSize.y);
      }
      
      // Sansão (s.png)
      if (sansaoSpriteRef.current?.complete && sansaoSpriteRef.current.naturalWidth > 0) {
          ctx.drawImage(sansaoSpriteRef.current, cebX + 35, cebY + 20, 50, 60);
      } else {
          ctx.fillStyle = COLORS.SANSAO;
          ctx.fillRect(cebX + 40, cebY + 30, 40, 30);
      }

      // Mônica
      const isJumping = !isGroundedRef.current || Math.abs(monica.vel.y) > 5;
      const currentSprite = isJumping ? jumpSpriteRef.current : walkSpriteRef.current;
      
      if (currentSprite?.complete && currentSprite.naturalWidth > 0) {
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
      className="w-full h-full border-b-8 border-black shadow-inner block"
    />
  );
};

export default GameCanvas;
