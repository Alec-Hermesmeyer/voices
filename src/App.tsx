import React from 'react';
import Chat from './components/Chat.tsx';

const App = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 p-6">
      {/* Chat Component */}
      <div className="w-full max-w-3xl  p-6">
        <Chat />
      </div>
    </div>
  );
};

export default App;
