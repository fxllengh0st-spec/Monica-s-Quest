
export class SoundManager {
  ctx: AudioContext;
  enabled: boolean;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.enabled = true;
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (!this.enabled || this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  jump() { this.playTone(400, 'sine', 0.3); }
  attack() { this.playTone(150, 'sawtooth', 0.1, 0.05); }
  coin() { this.playTone(1200, 'square', 0.1, 0.05); this.playTone(1800, 'square', 0.2, 0.05); }
  hit() { this.playTone(100, 'sawtooth', 0.3, 0.2); }
  enemyDeath() { this.playTone(200, 'square', 0.1); }
}

export class InputHandler {
  keys: { left: boolean; right: boolean; up: boolean; attack: boolean };

  constructor() {
    this.keys = { left: false, right: false, up: false, attack: false };
    this.bindKeyboard();
  }

  bindKeyboard() {
    window.addEventListener('keydown', e => this.handleKey(e, true));
    window.addEventListener('keyup', e => this.handleKey(e, false));
  }

  unbind() {
    window.removeEventListener('keydown', this.handleKey as any); // Typescript limitation workaround or use bound function
    // For simplicity in this port, we might leak listeners if not careful, 
    // but we'll assign the bound function to a variable if needed. 
    // Here we just accept simple event listeners for now.
  }

  handleKey(e: KeyboardEvent, isDown: boolean) {
    if(e.repeat) return;
    const code = e.code;
    if (code === 'ArrowLeft' || code === 'KeyA') this.keys.left = isDown;
    if (code === 'ArrowRight' || code === 'KeyD') this.keys.right = isDown;
    if (code === 'ArrowUp' || code === 'Space') this.keys.up = isDown;
    if (code === 'KeyZ' || code === 'KeyK') this.keys.attack = isDown;
  }

  setKey(key: keyof typeof this.keys, value: boolean) {
      this.keys[key] = value;
  }
}

class Entity {
  x: number; y: number; w: number; h: number;
  vx: number; vy: number;
  markedForDeletion: boolean;

  constructor(x: number, y: number, w: number, h: number) {
      this.x = x; this.y = y; this.w = w; this.h = h;
      this.vx = 0; this.vy = 0;
      this.markedForDeletion = false;
  }
  
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  checkCollision(other: {x: number, y: number, w: number, h: number}) {
      return (this.x < other.x + other.w && this.x + this.w > other.x &&
              this.y < other.y + other.h && this.y + this.h > other.y);
  }
}

class Particle extends Entity {
  life: number;
  color: string;

  constructor(x: number, y: number, color: string) {
      super(x, y, Math.random() * 4 + 2, Math.random() * 4 + 2);
      this.vx = (Math.random() - 0.5) * 10;
      this.vy = (Math.random() - 0.5) * 10;
      this.life = 1.0;
      this.color = color;
  }
  update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= 0.05;
      if (this.life <= 0) this.markedForDeletion = true;
  }
  draw(ctx: CanvasRenderingContext2D, camX: number) {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillRect(this.x - camX, this.y, this.w, this.h);
      ctx.globalAlpha = 1.0;
  }
}

class Player extends Entity {
  speed: number = 5;
  jumpForce: number = -14;
  grounded: boolean = false;
  facingRight: boolean = true;
  isAttacking: boolean = false;
  attackTimer: number = 0;
  invulnerable: number = 0;
  sansaoAngle: number = 0;
  lives: number = 3;
  color: string = '#E53935';

  constructor(x: number, y: number) {
      super(x, y, 40, 60);
  }

  update(input: InputHandler, map: any[], enemies: any[], particles: Particle[], audio: SoundManager, game: AdventureEngine) {
      if (input.keys.left) { this.vx = -this.speed; this.facingRight = false; }
      else if (input.keys.right) { this.vx = this.speed; this.facingRight = true; }
      else { this.vx *= 0.8; }

      this.x += this.vx;
      this.handleMapCollision(map, 'x');

      this.vy += 0.8; 
      this.y += this.vy;
      this.grounded = false;
      this.handleMapCollision(map, 'y');

      if (input.keys.up && this.grounded) {
          this.vy = this.jumpForce;
          audio.jump();
          for(let i=0; i<5; i++) particles.push(new Particle(this.x + this.w/2, this.y + this.h, '#ddd'));
      }

      if (input.keys.attack && !this.isAttacking) {
          this.isAttacking = true;
          this.attackTimer = 20; 
          audio.attack();
      }

      if (this.isAttacking) {
          this.attackTimer--;
          this.sansaoAngle += 0.5;
          const reach = 60;
          const hitX = this.facingRight ? this.x + this.w : this.x - reach;
          const hitBox = { x: hitX, y: this.y, w: reach, h: this.h };
          
          enemies.forEach(e => {
              if (e.checkCollision(hitBox)) {
                  e.die(particles, audio, game);
              }
          });

          if (this.attackTimer <= 0) {
              this.isAttacking = false;
              this.sansaoAngle = 0;
          }
      }

      if (this.invulnerable > 0) this.invulnerable--;
      if (this.y > 1000) game.loseLife();
  }

  handleMapCollision(map: any[], axis: 'x' | 'y') {
      for (let tile of map) {
          if (this.checkCollision(tile)) {
              if (axis === 'x') {
                  if (this.vx > 0) this.x = tile.x - this.w;
                  else if (this.vx < 0) this.x = tile.x + tile.w;
                  this.vx = 0;
              } else {
                  if (this.vy > 0) { 
                      this.y = tile.y - this.h;
                      this.grounded = true;
                      this.vy = 0;
                  } else if (this.vy < 0) {
                      this.y = tile.y + tile.h;
                      this.vy = 0;
                  }
              }
          }
      }
  }

  draw(ctx: CanvasRenderingContext2D, camX: number) {
      if (this.invulnerable > 0 && Math.floor(Date.now() / 100) % 2 === 0) return; 

      const x = this.x - camX;
      const y = this.y;

      // Body
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 20);
      ctx.lineTo(x + 30, y + 20);
      ctx.lineTo(x + 40, y + 60);
      ctx.lineTo(x, y + 60);
      ctx.fill();

      // Head
      ctx.fillStyle = '#FFE0BD';
      ctx.beginPath();
      ctx.arc(x + 20, y + 15, 15, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.ellipse(x + 20, y + 15, 16, 18, 0, Math.PI, 0); 
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x + 15 + (this.facingRight?4:0), y + 12, 2, 0, Math.PI*2);
      ctx.arc(x + 25 + (this.facingRight?0:-4), y + 12, 2, 0, Math.PI*2);
      ctx.fill();

      // Teeth
      ctx.fillStyle = 'white';
      ctx.fillRect(x + 18 + (this.facingRight?2:-2), y + 18, 4, 3);

      this.drawSansao(ctx, x, y);
  }

  drawSansao(ctx: CanvasRenderingContext2D, x: number, y: number) {
      ctx.fillStyle = '#2196F3';
      let sx, sy;
      
      if (this.isAttacking) {
          const offset = this.facingRight ? 40 : -10;
          sx = x + offset;
          sy = y + 30 + Math.sin(this.sansaoAngle) * 20;
          
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(sx - (this.facingRight?10:-10), sy-10, 10, 0, Math.PI*2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
      } else {
          sx = x + (this.facingRight ? 5 : 35);
          sy = y + 40;
      }

      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx - 3, sy - 10, 3, 8, -0.2, 0, Math.PI * 2);
      ctx.ellipse(sx + 3, sy - 10, 3, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
  }
}

class Enemy extends Entity {
  type: string;
  startX: number;
  patrolDist: number = 100;
  speed: number = 2;
  dir: number = 1;

  constructor(x: number, y: number, type: string) {
      super(x, y, 40, 50);
      this.type = type;
      this.startX = x;
  }

  update(map: any[]) {
      this.x += this.speed * this.dir;
      this.vx = this.speed * this.dir;

      if (this.x > this.startX + this.patrolDist) this.dir = -1;
      if (this.x < this.startX - this.patrolDist) this.dir = 1;

      this.vy += 0.8;
      this.y += this.vy;
      
      let grounded = false;
      for (let tile of map) {
          if (this.checkCollision(tile)) {
              if (this.y + this.h - this.vy <= tile.y) {
                  this.y = tile.y - this.h;
                  this.vy = 0;
                  grounded = true;
              } else {
                  this.dir *= -1;
              }
          }
      }
  }

  die(particles: Particle[], audio: SoundManager, game: AdventureEngine) {
      if (this.markedForDeletion) return;
      this.markedForDeletion = true;
      audio.enemyDeath();
      for(let i=0; i<10; i++) {
          particles.push(new Particle(this.cx, this.cy, this.type === 'cebolinha' ? '#4CAF50' : '#FFEB3B'));
      }
      game.addScore(100);
  }

  draw(ctx: CanvasRenderingContext2D, camX: number) {
      const x = this.x - camX;
      const y = this.y;

      ctx.fillStyle = this.type === 'cebolinha' ? '#4CAF50' : '#FFEB3B';
      ctx.fillRect(x + 5, y + 20, 30, 30);
      
      if (this.type === 'cascao') {
          ctx.fillStyle = '#795548';
          ctx.beginPath();
          ctx.arc(x+10, y+25, 3, 0, Math.PI*2);
          ctx.arc(x+30, y+40, 2, 0, Math.PI*2);
          ctx.fill();
      }

      ctx.fillStyle = '#FFE0BD';
      ctx.beginPath();
      ctx.arc(x + 20, y + 15, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.beginPath();
      if (this.type === 'cebolinha') {
          ctx.moveTo(x+20, y); ctx.lineTo(x+20, y-10);
          ctx.moveTo(x+15, y+2); ctx.lineTo(x+10, y-5);
          ctx.moveTo(x+25, y+2); ctx.lineTo(x+30, y-5);
          ctx.stroke();
      } else {
          ctx.arc(x + 20, y + 10, 14, Math.PI, 0);
          ctx.fill();
      }
      
      ctx.fillStyle = 'black';
      ctx.fillRect(x+10, y+50, 20, 10);
  }
}

class Collectible extends Entity {
  bobOffset: number;
  constructor(x: number, y: number) {
      super(x, y, 30, 30);
      this.bobOffset = Math.random() * Math.PI * 2;
  }
  
  update() {
      this.bobOffset += 0.1;
  }

  draw(ctx: CanvasRenderingContext2D, camX: number) {
      const y = this.y + Math.sin(this.bobOffset) * 5;
      const x = this.x - camX;
      
      ctx.fillStyle = '#2E7D32'; 
      ctx.beginPath();
      ctx.arc(x + 15, y + 15, 12, 0, Math.PI*2);
      ctx.fill();
      
      ctx.fillStyle = '#EF5350'; 
      ctx.beginPath();
      ctx.arc(x + 15, y + 15, 10, 0, Math.PI*2); 
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.fillRect(x+12, y+10, 2, 2);
      ctx.fillRect(x+18, y+14, 2, 2);
      ctx.fillRect(x+14, y+20, 2, 2);
  }
}

interface GameCallbacks {
    onScore: (s: number) => void;
    onLives: (l: number) => void;
    onGameOver: (finalScore: number) => void;
    onWin: (finalScore: number) => void;
}

export class AdventureEngine {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    audio: SoundManager;
    input: InputHandler;
    player: Player | null = null;
    entities: (Enemy | Collectible)[] = [];
    particles: Particle[] = [];
    map: any[] = [];
    camX: number = 0;
    levelWidth: number = 0;
    score: number = 0;
    flagX: number = 0;
    callbacks: GameCallbacks;
    animationFrameId: number = 0;
    isRunning: boolean = false;

    levelData = [
        "                                                                                ",
        "                                                                                ",
        "                                                                                ",
        "       M     M                                   M  M     C                     ",
        "      ===   ===                                 ======   ===                    ",
        " M                     C          M     K                                       ",
        "===                  =====       ===   ===    =======              M     M      ",
        "         C      M                                       M         ===   ===     ",
        "       =====   ===                                     ===                      ",
        "  P                                       M     M               C       K     F ",
        "###################  #######   #####################   #########################"
    ];

    constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
        this.audio = new SoundManager();
        this.input = new InputHandler();
        this.callbacks = callbacks;
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initLevel() {
        this.entities = [];
        this.map = [];
        this.particles = [];
        this.score = 0;
        
        const tileSize = 60;
        
        this.levelData.forEach((row, rowIndex) => {
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const char = row[colIndex];
                const x = colIndex * tileSize;
                const y = rowIndex * tileSize;
                
                if (char === '#') this.map.push({x, y, w: tileSize, h: tileSize, type: 'ground'});
                if (char === '=') this.map.push({x, y, w: tileSize, h: 20, type: 'plat'});
                if (char === 'P') this.player = new Player(x, y);
                if (char === 'C') this.entities.push(new Enemy(x, y, 'cebolinha'));
                if (char === 'K') this.entities.push(new Enemy(x, y, 'cascao'));
                if (char === 'M') this.entities.push(new Collectible(x, y + 15));
                if (char === 'F') this.flagX = x;
            }
        });
        
        this.levelWidth = this.levelData[0].length * tileSize;
        this.updateHUD();
    }

    start() {
        this.initLevel();
        this.isRunning = true;
        this.loop();
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
        // this.input.unbind(); // If we implemented unbind
    }

    loseLife() {
        if (!this.player) return;
        this.player.lives--;
        this.updateHUD();
        this.audio.hit();
        
        if (this.player.lives <= 0) {
            this.isRunning = false;
            this.callbacks.onGameOver(this.score);
        } else {
            this.player.x = 100;
            this.player.y = 100;
            this.player.vy = 0;
            this.player.invulnerable = 60;
        }
    }

    addScore(amount: number) {
        this.score += amount;
        this.updateHUD();
    }

    updateHUD() {
        if (this.player) {
            this.callbacks.onScore(this.score);
            this.callbacks.onLives(this.player.lives);
        }
    }

    win() {
        this.isRunning = false;
        this.callbacks.onWin(this.score);
    }

    update() {
        if (!this.isRunning || !this.player) return;

        this.player.update(this.input, this.map, this.entities.filter(e => e instanceof Enemy), this.particles, this.audio, this);

        this.entities.forEach(ent => {
            if (ent instanceof Enemy) {
                ent.update(this.map);
                if (!ent.markedForDeletion && this.player!.checkCollision(ent)) {
                    if (this.player!.vy > 0 && this.player!.y + this.player!.h - 10 < ent.y + ent.h/2) {
                        ent.die(this.particles, this.audio, this);
                        this.player!.vy = -8;
                    } else if (this.player!.invulnerable <= 0) {
                        this.loseLife();
                    }
                }
            } else if (ent instanceof Collectible) {
                ent.update();
                if (this.player!.checkCollision(ent)) {
                    ent.markedForDeletion = true;
                    this.addScore(50);
                    this.audio.coin();
                    for(let i=0; i<5; i++) this.particles.push(new Particle(ent.cx, ent.cy, '#4CAF50'));
                }
            }
        });

        this.entities = this.entities.filter(e => !e.markedForDeletion);
        
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.markedForDeletion);

        const targetCamX = this.player.x - this.canvas.width / 2;
        this.camX += (targetCamX - this.camX) * 0.1;
        this.camX = Math.max(0, Math.min(this.camX, this.levelWidth - this.canvas.width));

        if (this.player.x > this.flagX) this.win();
    }

    draw() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for(let i=0; i<10; i++) {
            let cx = (i * 300 - (this.camX * 0.5)) % (this.levelWidth + 1000);
            if (cx < -200) cx += this.levelWidth; 
            this.ctx.beginPath();
            this.ctx.arc(cx, 100 + (i%3)*50, 40, 0, Math.PI*2);
            this.ctx.arc(cx+50, 110 + (i%3)*50, 50, 0, Math.PI*2);
            this.ctx.fill();
        }

        this.ctx.save();
        
        this.ctx.fillStyle = '#8D6E63'; 
        this.map.forEach(tile => {
            if (tile.x - this.camX > this.canvas.width || tile.x + tile.w - this.camX < 0) return; 
            
            if (tile.type === 'ground') {
                this.ctx.fillStyle = '#5D4037';
                this.ctx.fillRect(tile.x - this.camX, tile.y, tile.w, tile.h);
                this.ctx.fillStyle = '#43A047';
                this.ctx.fillRect(tile.x - this.camX, tile.y, tile.w, 10);
            } else { 
                this.ctx.fillStyle = '#8D6E63';
                this.ctx.fillRect(tile.x - this.camX, tile.y, tile.w, tile.h);
            }
        });

        this.entities.forEach(ent => ent.draw(this.ctx, this.camX));
        
        if (this.player) this.player.draw(this.ctx, this.camX);

        this.particles.forEach(p => p.draw(this.ctx, this.camX));

        if (this.flagX) {
            const fx = this.flagX - this.camX;
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(fx, 200, 5, 400); 
            this.ctx.fillStyle = 'yellow';
            this.ctx.beginPath();
            this.ctx.moveTo(fx, 200);
            this.ctx.lineTo(fx+60, 230);
            this.ctx.lineTo(fx, 260);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    loop = () => {
        if (this.isRunning) {
            this.update();
            this.draw();
            this.animationFrameId = requestAnimationFrame(this.loop);
        }
    }
}
