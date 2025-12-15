
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, InputState } from './types';
import GameCanvas from './components/GameCanvas';
import StartScreen from './components/StartScreen';
import WinScreen from './components/WinScreen';
import GameOverScreen from './components/GameOverScreen';
import HUD from './components/HUD';
import MobileControls from './components/MobileControls';
import { Trophy, Rabbit, Info } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [distance, setDistance] = useState(0);
  const [score, setScore] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false
  });

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

  const startGame = useCallback(() => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setDistance(0);
  }, []);

  const handleWin = useCallback(() => {
    setGameState(GameState.WON);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState(GameState.GAME_OVER);
  }, []);

  return (
    <div className="relative w-full h-screen bg-sky-300 overflow-hidden flex flex-col items-center justify-center select-none touch-none">
      {/* Background Decor */}
      <div className="absolute top-10 left-10 opacity-20 pointer-events-none">
        <Rabbit size={isMobile ? 60 : 120} className="text-white" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none">
        <Trophy size={isMobile ? 60 : 120} className="text-white" />
      </div>

      <div className={`relative z-10 w-full max-w-[1024px] shadow-2xl md:rounded-xl overflow-hidden md:border-8 border-white/50 bg-sky-200 ${isMobile ? 'h-full flex flex-col' : 'aspect-[16/9]'}`}>
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
        <div className="mt-4 text-white text-sm flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
          <span className="flex items-center gap-1"><Info size={16} /> Use <b>Arrows</b> to Move & <b>Space</b> to Jump. Catch Sansão!</span>
        </div>
      )}
    </div>
  );
};

export default App;
