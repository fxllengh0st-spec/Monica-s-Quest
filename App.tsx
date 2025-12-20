
import React, { useState } from 'react';
import { GameMode } from './types';
import MainMenu from './components/MainMenu';
import MarathonGame from './components/MarathonGame';
import AdventureGame from './components/AdventureGame';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>('MENU');

  return (
    <>
      {currentMode === 'MENU' && (
        <MainMenu onSelect={setCurrentMode} />
      )}
      
      {currentMode === 'MARATHON' && (
        <MarathonGame onExit={() => setCurrentMode('MENU')} />
      )}

      {currentMode === 'ADVENTURE' && (
        <AdventureGame onExit={() => setCurrentMode('MENU')} />
      )}
    </>
  );
};

export default App;
