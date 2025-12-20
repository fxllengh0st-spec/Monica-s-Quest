
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, InputState } from '../types';
import GameCanvas from './GameCanvas';
import StartScreen from './StartScreen';
import WinScreen from './WinScreen';
import GameOverScreen from './GameOverScreen';
import HUD from './HUD';
import MobileControls from './MobileControls';
import { Trophy, Rabbit, Info, ArrowLeft } from 'lucide-react';

interface Props {
  onExit: () => void;
}

const MarathonGame: React.FC<Props> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [distance, setDistance] = useState(0);
  const [score, setScore] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const BG_URL = 'https://static.wikia.nocookie.net/monica/images/9/96/Rua_do_Limoeiro_em_%27Os_Adolescentes%27.png/revision/latest?cb=20191121033259&path-prefix=pt-br';

  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false
  });

  // Detecção de Mobile
  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmall = window.innerWidth < 1024;
      setIsMobile(hasTouch || isSmall);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handlers de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          inputRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          inputRef.current.right = true;
          break;
        case 'ArrowUp':
        case 'Space':
        case 'KeyW':
          inputRef.current.jump = true;
          // Previne scroll da página com espaço/setas
          if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          inputRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          inputRef.current.right = false;
          break;
        case 'ArrowUp':
        case 'Space':
        case 'KeyW':
          inputRef.current.jump = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const startGame = useCallback(() => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setDistance(0);
    // Reseta inputs ao iniciar para evitar estados travados
    inputRef.current = { left: false, right: false, jump: false };
  }, []);

  const handleWin = useCallback(() => {
    setGameState(GameState.WON);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState(GameState.GAME_OVER);
  }, []);

  return (
    <div 
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center select-none touch-none bg-cover bg-center"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      {/* Overlay para legibilidade e profundidade */}
      <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>

      <button onClick={onExit} className="absolute top-4 left-4 z-50 bg-black/40 p-2 rounded-full hover:bg-black/60 text-white backdrop-blur-sm">
        <ArrowLeft size={24} />
      </button>

      <div className={`relative z-10 w-full max-w-[1024px] shadow-2xl md:rounded-xl overflow-hidden md:border-8 border-white/30 bg-black/20 ${isMobile ? 'h-full flex flex-col' : 'aspect-[16/9]'}`}>
        {gameState === GameState.START && (
          <StartScreen onStart={startGame} />
        )}

        {gameState === GameState.PLAYING && (
          <div className="relative flex-1 w-full">
            <HUD distance={distance} score={score} isMobile={isMobile} />
            <GameCanvas 
              onWin={handleWin} 
              onGameOver={handleGameOver} 
              onUpdateMetrics={(d) => setDistance(d)}
              inputRef={inputRef}
            />
            {isMobile && <MobileControls inputRef={inputRef} />}
          </div>
        )}

        {gameState === GameState.WON && (
          <WinScreen onRestart={startGame} />
        )}

        {gameState === GameState.GAME_OVER && (
          <GameOverScreen onRestart={startGame} />
        )}
      </div>

      {!isMobile && (
        <div className="mt-4 text-white text-sm flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
          <span className="flex items-center gap-1"><Info size={16} /> Use <b>Arrows</b> or <b>WASD</b> to Move & <b>Space</b> to Jump. Catch Sansão!</span>
        </div>
      )}
    </div>
  );
};

export default MarathonGame;
