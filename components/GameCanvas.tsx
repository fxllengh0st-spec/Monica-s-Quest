
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
  BACKGROUND: 'https://i.ibb.co/3ykG4S3/bg-limoeiro.webp', // URL de backup para o fundo
  CEBOLINHA: 'https://images.seeklogo.com/logo-png/2/2/cebolinha-logo-png_seeklogo-27755.png',
  CASCAO: 'https://upload.wikimedia.org/wikipedia/pt/3/35/Cascao.png',
  SANSAO: 'https://upload.wikimedia.org/wikipedia/pt/2/2a/Sans%C3%A3o_%28Mauricio_de_Sousa_Produ%C3%A7%C3%B5es%29.png'
};

const GameCanvas: React.FC<Props> = ({ onWin, onGameOver, onUpdateMetrics, inputRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const walkSpriteRef = useRef<HTMLImageElement | null>(null);
  const jumpSpriteRef = useRef<HTMLImageElement | null>(null);
  const backgroundSpriteRef = useRef<HTMLImageElement | null>(null);
  const cebolinhaSpriteRef = useRef<HTMLImageElement | null>(null);
  const cascaoSpriteRef = useRef<HTMLImageElement | null>(null);
  const sansaoSpriteRef = useRef<HTMLImageElement | null>(null);
  
  const soundManager = useRef<SoundManager | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  const enemiesRef = useRef<EnemyEntity[]>(LEVEL_ENEMIES.map(e => ({
    pos: { x: e.x, y: e.y },
    size: { x: 54, y: 72 }, 
    vel: { x: 2.5, y: 0 },
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
    size: { x: 64, y: 72 }, 
    vel: { x: 0, y: 0 },
    color: COLORS.MONICA
  });
  
  const cebolinhaVitoriaPos: Vector2D = { x: 5800, y: 320 };
  const cebolinhaSize: Vector2D = { x: 64, y: 80 };

  const cameraRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isGroundedRef = useRef<boolean>(false);
  const facingRightRef = useRef<boolean>(true);

  useEffect(() => {
    soundManager.current = new SoundManager();
    
    const loadImage = (src: string, ref: React.MutableRefObject<HTMLImageElement | null>) => {
      const img = new Image();
      img.src = src;
      img.crossOrigin = "anonymous";
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
        vel: { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 12 },
        color,
        life: 1.0,
        maxLife: 1.0,
        opacity: 1.0
      });
    }
  };

  const drawProceduralMonica = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, facingRight: boolean, isJumping: boolean) => {
    ctx.save();
    ctx.fillStyle = COLORS.MONICA;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 25);
    ctx.lineTo(x + w - 10, y + 25);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.fill();
    ctx.fillStyle = '#FFE0BD';
    ctx.beginPath();
    ctx.arc(x + w/2, y + 18, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + 15, 20, 15, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'black';
    const eyeX = facingRight ? x + w/2 + 5 : x + w/2 - 10;
    ctx.beginPath();
    ctx.arc(eyeX, y + 15, 2.5, 0, Math.PI * 2);
    ctx.arc(eyeX + 8, y + 15, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillRect(x + w/2 - 3, y + 22, 6, 4);
    ctx.restore();
  };

  const drawProceduralEnemy = (ctx: CanvasRenderingContext2D, enemy: EnemyEntity, facingRight: boolean) => {
    const { x, y } = { x: enemy.pos.x, y: enemy.pos.y };
    const { x: w, y: h } = enemy.size;
    ctx.save();
    ctx.fillStyle = enemy.type === 'cebolinha' ? '#22C55E' : '#FACC15';
    ctx.fillRect(x + 10, y + 25, w - 20, h - 25);
    ctx.fillStyle = '#FFE0BD';
    ctx.beginPath();
    ctx.arc(x + w/2, y + 18, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    if (enemy.type === 'cebolinha') {
      for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.moveTo(x + w/2, y + 5);
        ctx.lineTo(x + w/2 - 10 + i*5, y - 5);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x + w/2, y + 12, 16, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawProceduralSansao = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = '#4FACEF';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 15, 4, 12, -0.2, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y - 15, 4, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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

      isGroundedRef.current = resolveCollisions(monica, LEVEL_PLATFORMS);

      if (inputRef.current.jump && isGroundedRef.current) {
        monica.vel.y = SETTINGS.jumpForce;
        isGroundedRef.current = false;
        soundManager.current?.jump();
        createParticles(monica.pos.x + monica.size.x / 2, monica.pos.y + monica.size.y, '#ffffff', 8);
      }

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
            createParticles(enemy.pos.x + enemy.size.x / 2, enemy.pos.y, enemy.color, 15);
          } else {
            onGameOver();
          }
        }
      });

      collectiblesRef.current.forEach(c => {
        if (c.isCollected) return;
        if (checkAABB(monica, c)) {
          c.isCollected = true;
          soundManager.current?.coin();
          createParticles(c.pos.x + c.size.x / 2, c.pos.y + c.size.y / 2, COLORS.MELANCIA, 10);
        }
      });

      if (monica.pos.y > SETTINGS.canvasHeight) {
        onGameOver();
        return;
      }

      if (checkAABB(monica, { pos: cebolinhaVitoriaPos, size: cebolinhaSize })) {
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
      ctx.clearRect(0, 0, SETTINGS.canvasWidth, SETTINGS.canvasHeight);
      
      const bg = backgroundSpriteRef.current;
      if (bg && bg.complete && bg.naturalWidth > 0) {
        const bgW = SETTINGS.canvasWidth;
        const bgX = -(cameraRef.current * 0.4) % bgW;
        ctx.drawImage(bg, bgX, 0, bgW, SETTINGS.canvasHeight);
        ctx.drawImage(bg, bgX + bgW, 0, bgW, SETTINGS.canvasHeight);
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, SETTINGS.canvasHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SETTINGS.canvasWidth, SETTINGS.canvasHeight);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for(let i=0; i<8; i++) {
          let cx = (i * 400 - (cameraRef.current * 0.2)) % (SETTINGS.levelLength);
          if (cx < -200) cx += SETTINGS.levelLength;
          if (cx < SETTINGS.canvasWidth + 200) {
            ctx.beginPath(); ctx.arc(cx, 100 + (i%3)*40, 30, 0, Math.PI*2); ctx.arc(cx+30, 100 + (i%3)*40, 40, 0, Math.PI*2); ctx.arc(cx+60, 100 + (i%3)*40, 30, 0, Math.PI*2); ctx.fill();
          }
        }
      }

      ctx.save();
      ctx.translate(-cameraRef.current, 0);
      
      for (const p of LEVEL_PLATFORMS) {
        ctx.fillStyle = COLORS.GROUND; ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = COLORS.GRASS; ctx.fillRect(p.x, p.y, p.w, 14);
      }

      collectiblesRef.current.forEach(c => {
        if (c.isCollected) return;
        const bob = Math.sin(timestamp / 200) * 8;
        ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.ellipse(c.pos.x + 16, c.pos.y + 16 + bob, 16, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = COLORS.MELANCIA; ctx.beginPath(); ctx.ellipse(c.pos.x + 16, c.pos.y + 16 + bob, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
      });

      enemiesRef.current.forEach(e => {
        if (e.isDead) return;
        const sprite = e.type === 'cebolinha' ? cebolinhaSpriteRef.current : cascaoSpriteRef.current;
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
          ctx.save();
          if (e.dir > 0) {
            ctx.translate(e.pos.x + e.size.x, e.pos.y);
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, 0, 0, e.size.x, e.size.y);
          } else {
            ctx.drawImage(sprite, e.pos.x, e.pos.y, e.size.x, e.size.y);
          }
          ctx.restore();
        } else {
          drawProceduralEnemy(ctx, e, e.dir > 0);
        }
      });

      particlesRef.current.forEach((p, index) => {
        p.pos.x += p.vel.x * dt; p.pos.y += p.vel.y * dt;
        p.life -= 0.02 * dt;
        if (p.life <= 0) particlesRef.current.splice(index, 1);
        else {
          ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
          ctx.fillRect(p.pos.x, p.pos.y, p.size.x, p.size.y);
          ctx.globalAlpha = 1.0;
        }
      });

      const jiggle = Math.sin(timestamp / 150) * 5;
      const cebX = cebolinhaVitoriaPos.x;
      const cebY = cebolinhaVitoriaPos.y + jiggle;
      
      const vitoriaSprite = cebolinhaSpriteRef.current;
      if (vitoriaSprite && vitoriaSprite.complete && vitoriaSprite.naturalWidth > 0) {
          ctx.drawImage(vitoriaSprite, cebX, cebY, 64, 80);
      } else {
          drawProceduralEnemy(ctx, { pos: { x: cebX, y: cebY }, size: { x: 64, y: 80 }, type: 'cebolinha' } as any, false);
      }
      
      const s = sansaoSpriteRef.current;
      if (s && s.complete && s.naturalWidth > 0) {
          ctx.drawImage(s, cebX + 45, cebY + 20, 40, 50);
      } else {
          drawProceduralSansao(ctx, cebX + 60, cebY + 45);
      }

      const currentSprite = !isGroundedRef.current ? jumpSpriteRef.current : walkSpriteRef.current;
      const dW = 64, dH = 80;
      const dX = monica.pos.x, dY = monica.pos.y - (dH - monica.size.y) + 4; 
      
      if (currentSprite && currentSprite.complete && currentSprite.naturalWidth > 0) {
        ctx.save();
        if (!facingRightRef.current) {
          ctx.translate(dX + dW, dY);
          ctx.scale(-1, 1);
          ctx.drawImage(currentSprite, 0, 0, dW, dH);
        } else {
          ctx.drawImage(currentSprite, dX, dY, dW, dH);
        }
        ctx.restore();
      } else {
        drawProceduralMonica(ctx, dX, dY, dW, dH, facingRightRef.current, !isGroundedRef.current);
      }

      ctx.restore();
      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [onWin, onGameOver, onUpdateMetrics, inputRef]);

  return <canvas ref={canvasRef} width={SETTINGS.canvasWidth} height={SETTINGS.canvasHeight} className="w-full h-full block bg-transparent" />;
};

export default GameCanvas;
