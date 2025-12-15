
import React from 'react';

interface Props {
  onStart: () => void;
}

const StartScreen: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center bg-[#87CEEB] z-50 p-4">
      {/* City Background Silhouette (Static) */}
      <div className="absolute bottom-0 w-full h-1/2 bg-[#72c6e6]/50 pointer-events-none" style={{ clipPath: 'polygon(0% 100%, 10% 80%, 15% 90%, 25% 60%, 35% 85%, 45% 40%, 55% 80%, 65% 50%, 75% 90%, 85% 60%, 100% 100%)' }}></div>
      
      {/* Title with Pixel Sansão */}
      <div className="relative mt-8 flex flex-col items-center">
        <div className="w-24 h-24 mb-4 flex flex-col items-center relative">
          <div className="w-16 h-20 bg-[#4FACEF] border-4 border-black relative rounded-t-lg">
             <div className="absolute -top-12 left-0 w-6 h-14 bg-[#4FACEF] border-4 border-black rounded-t-full"></div>
             <div className="absolute -top-12 right-0 w-6 h-14 bg-[#4FACEF] border-4 border-black rounded-t-full"></div>
             <div className="absolute top-4 left-3 w-3 h-3 bg-white border-2 border-black"></div>
             <div className="absolute top-4 right-3 w-3 h-3 bg-white border-2 border-black"></div>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-yellow-400 text-2xl font-game drop-shadow-md mb-[-10px]">DO</h2>
          <h1 className="text-5xl sm:text-7xl font-game text-[#E52421] stroke-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter">
            MARATONA
          </h1>
          <h1 className="text-4xl sm:text-6xl font-game text-[#4FACEF] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter">
            COELHO
          </h1>
        </div>
      </div>

      {/* Main Action */}
      <div className="mt-8 z-10">
        <button
          onClick={onStart}
          className="bg-[#E52421] hover:bg-red-500 text-white font-game text-2xl py-4 px-12 rounded-full border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.5)] transform hover:scale-110 active:scale-95 transition-all uppercase"
        >
          JOGAR
        </button>
      </div>

      {/* Bottom Info Boxes (Retro Style) */}
      <div className="mt-auto mb-8 w-full max-w-4xl flex flex-wrap justify-center gap-6 z-10">
        <div className="retro-box p-4 w-64 text-[10px] text-white leading-relaxed text-center">
          <div className="text-yellow-400 mb-2">★</div>
          ACUMULANDO TODAS VOCÊ GANHA CRÉDITOS PARA O SITE DO CARTOON NETWORK
        </div>
        
        <div className="retro-box p-4 w-64 flex flex-col gap-2">
            <div className="flex items-center gap-4">
                <div className="bg-yellow-400 border-2 border-black w-8 h-8 flex items-center justify-center text-black font-bold">P</div>
                <span className="text-white text-[10px]">PAUSAR</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-yellow-400 border-2 border-black w-8 h-8 flex items-center justify-center text-black font-bold">▲</div>
                <span className="text-white text-[10px]">PULAR</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-yellow-400 border-2 border-black w-8 h-8 flex items-center justify-center text-black font-bold">▼</div>
                <span className="text-white text-[10px]">ABAIXAR</span>
            </div>
        </div>
      </div>

      {/* Character Previews */}
      <div className="absolute bottom-32 left-10 w-16 h-20 bg-red-500 border-2 border-black hidden md:block"></div>
      <div className="absolute bottom-32 right-10 w-16 h-20 bg-green-500 border-2 border-black hidden md:block"></div>
    </div>
  );
};

export default StartScreen;
