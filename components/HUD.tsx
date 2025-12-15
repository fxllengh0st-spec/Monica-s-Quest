
import React from 'react';

interface Props {
  distance: number;
  score: number;
  isMobile?: boolean;
}

const HUD: React.FC<Props> = ({ distance, score, isMobile }) => {
  const levelTarget = 5800;
  const progress = Math.min((distance / levelTarget) * 100, 100);
  const stars = Math.floor(distance / 100);

  return (
    <div className="absolute top-4 left-0 right-0 z-20 px-4 flex justify-between items-start pointer-events-none">
      {/* Progress Bar (Retro) */}
      <div className="flex flex-col gap-2">
        <div className="bg-black/50 border-2 border-black p-1 w-48 sm:w-64">
          <div 
            className="h-4 bg-red-500 border border-white/30 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-white font-game text-[10px] drop-shadow-md">
           {distance}M / {levelTarget}M
        </div>
      </div>

      {/* Star Counter (SNES Style) */}
      <div className="flex items-center gap-2">
        <div className="text-yellow-400 text-4xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">★</div>
        <span className="text-white font-game text-3xl drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
          {stars}
        </span>
      </div>
    </div>
  );
};

export default HUD;
