
import React from 'react';
import { Rabbit, Map } from 'lucide-react';
import { GameMode } from '../types';

interface Props {
  onSelect: (mode: GameMode) => void;
}

const MainMenu: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-12 drop-shadow-lg text-center font-game">
        ESCOLHA SUA AVENTURA
      </h1>

      <div className="flex flex-col md:flex-row gap-8 max-w-4xl w-full">
        {/* Game 1 Card */}
        <button 
          onClick={() => onSelect('MARATHON')}
          className="flex-1 bg-white/10 backdrop-blur-md border-4 border-white/20 rounded-3xl p-8 transition-all hover:scale-105 hover:bg-white/20 hover:border-yellow-400 group flex flex-col items-center"
        >
          <div className="w-32 h-32 bg-sky-300 rounded-full flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg border-4 border-white">
             <Rabbit size={64} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">MARATONA DO COELHO</h2>
          <p className="text-white/80 text-center mb-6">Corra atrás do Sansão em um estilo "Endless Runner" frenético!</p>
          <span className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-full uppercase text-sm">JOGAR AGORA</span>
        </button>

        {/* Game 2 Card */}
        <button 
          onClick={() => onSelect('ADVENTURE')}
          className="flex-1 bg-white/10 backdrop-blur-md border-4 border-white/20 rounded-3xl p-8 transition-all hover:scale-105 hover:bg-white/20 hover:border-green-400 group flex flex-col items-center"
        >
          <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform shadow-lg border-4 border-white">
             <Map size={64} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">AVENTURA NO LIMOEIRO</h2>
          <p className="text-white/80 text-center mb-6">Explore o bairro, colete melancias e derrote inimigos em um Plataforma Clássico.</p>
          <span className="px-6 py-2 bg-green-400 text-black font-bold rounded-full uppercase text-sm">JOGAR AGORA</span>
        </button>
      </div>

      <div className="mt-12 text-white/50 text-sm">
        Turma da Mônica © Maurício de Sousa Produções. Fan Game.
      </div>
    </div>
  );
};

export default MainMenu;
