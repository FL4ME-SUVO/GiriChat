import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && room) {
      onLogin(username, room);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass">
        <h2 className="login-title">Join Chat</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="input-group">
            <select value={room} onChange={(e) => setRoom(e.target.value)}>
              <option value="general">General</option>
              <option value="tech">Tech Talk</option>
              <option value="gaming">Gaming</option>
              <option value="random">Random</option>
            </select>
          </div>
          <button type="submit" className="join-button">
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;