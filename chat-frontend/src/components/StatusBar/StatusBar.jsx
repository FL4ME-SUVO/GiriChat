import React from 'react';
import './StatusBar.css';

const StatusBar = ({ room, typingUsers }) => {
  return (
    <div className="status-bar">
      <div className="room-indicator">
        <span className="room-name">#{room}</span>
        <span className="online-dot"></span>
        <span>Online</span>
      </div>
      
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          <span className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
          {typingUsers.length === 1 
            ? `${typingUsers[0]} is typing...` 
            : `${typingUsers.join(', ')} are typing...`}
        </div>
      )}
    </div>
  );
};

export default StatusBar;