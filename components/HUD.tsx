
import React, { useState, useEffect } from 'react';

interface Props {
  distance: number;
  score: number;
  isMobile?: boolean;
}

const HUD: React.FC<Props> = ({ distance, score, isMobile }) => {
  const levelTarget = 5800;
  const progress = Math.min((distance / levelTarget) * 100, 100);
  const stars = Math.floor(distance / 100);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const savedBest = localStorage.getItem('maratona_best');
    if (savedBest) setBest(parseInt(savedBest));
    
    if (distance > best) {
      setBest(distance);
      localStorage.setItem('maratona_best', distance.toString());
    }
  }, [distance, best]);

  return (
    <div className="absolute top-4 left-0 right-0 z-20 px-4 flex justify-between items-start pointer-events-none">
      {/* Progress Bar (Retro) */}
      <div className="flex flex-col gap-2">
        <div className="bg-black/70 border-2 border-black p-1 w-48 sm:w-64 backdrop-blur-sm">
          <div 
            className="h-4 bg-red-500 border border-white/30 transition-all duration-300 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <div className="flex flex-col">
            <div className="text-white font-game text-[10px] drop-shadow-md">
               {distance}M / {levelTarget}M
            </div>
            <div className="text-yellow-300 font-game text-[8px] drop-shadow-md mt-1">
               MELHOR: {best}M
            </div>
        </div>
      </div>

      {/* Star Counter (SNES Style) */}
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
            <div className="text-yellow-400 text-3xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] animate-pulse">★</div>
            <span className="text-white font-game text-3xl drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            {stars}
            </span>
        </div>
        <div className="text-white/70 font-game text-[8px]">
            PONTOS: {score}
        </div>
      </div>
    </div>
  );
};

export default HUD;
