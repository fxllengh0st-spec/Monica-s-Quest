
import React from 'react';
import { Rabbit, Trophy, Play } from 'lucide-react';
import { GameMode } from '../types';

interface Props {
  onSelect: (mode: GameMode) => void;
}

const MainMenu: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        {/* Character Icon / Logo Area */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/40 transition-all duration-500"></div>
          <div className="relative w-40 h-40 md:w-56 md:h-56 bg-white rounded-full flex items-center justify-center shadow-2xl border-8 border-sky-200 transform group-hover:scale-105 transition-transform duration-300">
             <Rabbit size={80} className="text-sky-500 md:hidden" />
             <Rabbit size={120} className="text-sky-500 hidden md:block" />
             <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-4 rounded-full shadow-lg border-4 border-white rotate-12">
                <Trophy size={32} className="text-white" />
             </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] text-center font-game tracking-tighter leading-tight">
          MARATONA DO <span className="text-yellow-300">COELHO</span>
        </h1>
        
        <p className="text-white/90 text-center text-lg md:text-xl mb-12 max-w-md font-medium leading-relaxed drop-shadow-sm">
          O Cebolinha pegou o Sansão! Corra pelo Bairro do Limoeiro e recupere o coelhinho azul da Mônica agora mesmo.
        </p>

        <button 
          onClick={() => onSelect('MARATHON')}
          className="group relative w-full max-w-xs bg-white text-blue-600 font-game text-2xl py-6 px-10 rounded-full shadow-[0_10px_0_rgb(226,232,240)] hover:shadow-[0_5px_0_rgb(226,232,240)] hover:translate-y-[5px] active:shadow-none active:translate-y-[10px] transition-all flex items-center justify-center gap-4 overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10 flex items-center gap-3">
            <Play fill="currentColor" size={24} /> JOGAR
          </span>
        </button>

        <div className="mt-16 flex flex-col items-center gap-2">
            <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 text-white text-xs font-bold uppercase tracking-widest">Plataforma 2D</div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 text-white text-xs font-bold uppercase tracking-widest">60 FPS</div>
            </div>
            <p className="text-white/40 text-[10px] mt-4 uppercase tracking-[0.2em]">
                Maurício de Sousa Produções • Fan Project
            </p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
