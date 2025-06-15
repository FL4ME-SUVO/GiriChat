import React, { useState } from 'react';
import Login from './components/Login/Login';
import ChatContainer from './components/ChatContainer/ChatContainer';
import './App.css';

function App() {
  const [userData, setUserData] = useState(null);

  const handleLogin = (username, room) => {
    setUserData({ username, room });
  };

  return (
    <div className="app">
      {!userData ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ChatContainer userData={userData} />
      )}
    </div>
  );
}

export default App;