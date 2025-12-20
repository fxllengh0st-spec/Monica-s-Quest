
import React, { useRef, useEffect, useState } from 'react';
import { AdventureEngine } from '../engine/adventure';
import { RotateCcw, ArrowLeft, Play } from 'lucide-react';

interface Props {
  onExit: () => void;
}

const AdventureGame: React.FC<Props> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AdventureEngine | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'win'>('start');
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new AdventureEngine(canvasRef.current, {
      onScore: (s) => setScore(s),
      onLives: (l) => setLives(l),
      onGameOver: (s) => {
        setFinalScore(s);
        setGameState('gameover');
      },
      onWin: (s) => {
        setFinalScore(s);
        setGameState('win');
      }
    });

    engineRef.current = engine;

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleStart = () => {
      setGameState('playing');
      engineRef.current?.start();
  };

  const handleRestart = () => {
      setGameState('playing');
      setScore(0);
      setLives(3);
      engineRef.current?.start();
  };

  const handleTouch = (key: 'left' | 'right' | 'up' | 'attack', active: boolean) => {
      engineRef.current?.input.setKey(key, active);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none select-none z-10">
         <div className="flex gap-4">
             <button onClick={onExit} className="pointer-events-auto bg-white/20 p-2 rounded-full hover:bg-white/40 text-white backdrop-blur-sm transition-all active:scale-95"><ArrowLeft size={24} /></button>
             <div className="text-white text-2xl font-bold drop-shadow-md">🍉 {score}</div>
         </div>
         <div className="text-white text-2xl font-bold drop-shadow-md">
             {'❤️'.repeat(lives)}
         </div>
      </div>

      {/* Mobile Controls */}
      <div className="absolute bottom-4 left-0 w-full px-4 h-32 pointer-events-none flex justify-between z-20 md:hidden">
          <div className="flex gap-4 pointer-events-auto self-end pb-4">
              <button 
                className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm active:bg-white/50 transition-all active:scale-90"
                onTouchStart={() => handleTouch('left', true)} onTouchEnd={() => handleTouch('left', false)}
              >⬅️</button>
              <button 
                className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm active:bg-white/50 transition-all active:scale-90"
                onTouchStart={() => handleTouch('right', true)} onTouchEnd={() => handleTouch('right', false)}
              >➡️</button>
          </div>
          <div className="flex gap-4 pointer-events-auto self-end pb-4">
               <button 
                className="w-20 h-20 bg-red-500/40 border-2 border-red-500 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm active:bg-red-500/60 transition-all active:scale-90"
                onTouchStart={() => handleTouch('attack', true)} onTouchEnd={() => handleTouch('attack', false)}
              >🐰</button>
               <button 
                className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm active:bg-white/50 transition-all active:scale-90"
                onTouchStart={() => handleTouch('up', true)} onTouchEnd={() => handleTouch('up', false)}
              >⬆️</button>
          </div>
      </div>

      {/* Modals */}
      {gameState === 'start' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white p-8 text-center">
              <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg uppercase tracking-widest">Aventura no Limoeiro</h1>
              <p className="text-lg text-white/80 max-w-lg mb-12">Ajude a Mônica a derrotar o Cebolinha e recuperar suas melancias! Use as setas para mover e Z para usar o Sansão.</p>
              <button 
                onClick={handleStart} 
                className="bg-red-600 px-12 py-5 rounded-full font-bold text-2xl hover:bg-red-500 transition-all transform hover:scale-110 active:scale-95 flex items-center gap-3 shadow-[0_10px_0_rgb(153,27,27)] border-b-4 border-red-800"
              >
                  <Play size={32} /> COMEÇAR
              </button>
          </div>
      )}

      {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white p-8">
              <h1 className="text-6xl font-bold text-red-500 mb-4 animate-bounce">Fim de Jogo!</h1>
              <p className="text-3xl mb-8">Sua pontuação: <span className="text-yellow-400 font-bold">{finalScore}</span></p>
              <div className="flex gap-4">
                <button onClick={handleRestart} className="bg-red-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-red-500 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg">
                    <RotateCcw /> Tentar Novamente
                </button>
                <button onClick={onExit} className="bg-gray-700 px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                    Sair
                </button>
              </div>
          </div>
      )}

      {gameState === 'win' && (
          <div className="absolute inset-0 bg-green-900/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 text-white p-8">
              <h1 className="text-7xl font-bold text-green-400 mb-4 drop-shadow-lg">Vitória!</h1>
              <p className="text-2xl mb-4 text-green-100">Você recuperou o Limoeiro e trouxe paz de volta!</p>
              <p className="text-4xl mb-12">Pontuação Final: <span className="text-yellow-400 font-bold">{finalScore}</span></p>
              <div className="flex gap-6">
                  <button onClick={handleRestart} className="bg-green-600 px-10 py-5 rounded-full font-bold text-2xl hover:bg-green-500 transition-all transform hover:scale-110 active:scale-95 flex items-center gap-2 shadow-xl border-b-4 border-green-800">
                      <RotateCcw size={32} /> JOGAR DE NOVO
                  </button>
                  <button onClick={onExit} className="bg-white/10 px-10 py-5 rounded-full font-bold text-2xl hover:bg-white/20 transition-all transform hover:scale-105 active:scale-95 border-2 border-white/20">
                    Sair
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdventureGame;
