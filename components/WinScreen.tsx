
import React from 'react';
import { RotateCcw, Heart } from 'lucide-react';

interface Props {
  onRestart: () => void;
}

const WinScreen: React.FC<Props> = ({ onRestart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/90 backdrop-blur-sm z-50 p-8 text-center animate-in fade-in duration-500">
      <div className="bg-white p-12 rounded-3xl shadow-2xl flex flex-col items-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Heart size={48} className="text-red-500 animate-pulse" />
        </div>
        <h1 className="text-5xl font-game text-green-600 mb-4">
          YOU CAUGHT SANSÃO!
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-md">
          Great job! Monica is happy again and her bunny is safe back in her arms.
        </p>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-game text-xl py-4 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg border-b-4 border-blue-700"
        >
          <RotateCcw size={24} />
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export default WinScreen;
