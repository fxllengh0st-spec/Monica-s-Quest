
import React from 'react';
import MarathonGame from './components/MarathonGame';

const App: React.FC = () => {
  // Removido o estado de GameMode e o MainMenu para iniciar diretamente no jogo
  return (
    <MarathonGame onExit={() => window.location.reload()} />
  );
};

export default App;
