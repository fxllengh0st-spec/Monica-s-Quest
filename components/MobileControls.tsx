
import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpCircle } from 'lucide-react';
import { InputState } from '../types';

interface Props {
  inputRef: React.MutableRefObject<InputState>;
}

const MobileControls: React.FC<Props> = ({ inputRef }) => {
  const handleTouch = (key: keyof InputState, active: boolean) => {
    inputRef.current[key] = active;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-end justify-between p-6 sm:p-10">
      {/* Left/Right D-Pad */}
      <div className="flex gap-4 pointer-events-auto">
        <button
          className="w-16 h-16 sm:w-20 sm:h-20 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/40 active:bg-white/50 active:scale-95 transition-all"
          onTouchStart={() => handleTouch('left', true)}
          onTouchEnd={() => handleTouch('left', false)}
          onMouseDown={() => handleTouch('left', true)}
          onMouseUp={() => handleTouch('left', false)}
          aria-label="Move Left"
        >
          <ChevronLeft size={40} className="text-white" />
        </button>
        <button
          className="w-16 h-16 sm:w-20 sm:h-20 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/40 active:bg-white/50 active:scale-95 transition-all"
          onTouchStart={() => handleTouch('right', true)}
          onTouchEnd={() => handleTouch('right', false)}
          onMouseDown={() => handleTouch('right', true)}
          onMouseUp={() => handleTouch('right', false)}
          aria-label="Move Right"
        >
          <ChevronRight size={40} className="text-white" />
        </button>
      </div>

      {/* Jump Button */}
      <div className="pointer-events-auto">
        <button
          className="w-20 h-20 sm:w-24 sm:h-24 bg-red-600/80 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/50 active:bg-red-500 active:scale-90 transition-all shadow-xl"
          onTouchStart={() => handleTouch('jump', true)}
          onTouchEnd={() => handleTouch('jump', false)}
          onMouseDown={() => handleTouch('jump', true)}
          onMouseUp={() => handleTouch('jump', false)}
          aria-label="Jump"
        >
          <ArrowUpCircle size={48} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default MobileControls;
