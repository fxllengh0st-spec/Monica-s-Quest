
import React from 'react';
import { RotateCcw, Frown } from 'lucide-react';

interface Props {
  onRestart: () => void;
}

const GameOverScreen: React.FC<Props> = ({ onRestart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm z-50 p-8 text-center animate-in zoom-in duration-300">
      <div className="bg-white p-12 rounded-3xl shadow-2xl flex flex-col items-center">
        <Frown size={64} className="text-red-600 mb-6" />
        <h1 className="text-5xl font-game text-red-600 mb-4">
          GAME OVER!
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Monica fell! Don't let Sansão float away forever!
        </p>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-game text-xl py-4 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg border-b-4 border-red-800"
        >
          <RotateCcw size={24} />
          TRY AGAIN
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
