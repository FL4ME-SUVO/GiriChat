import React from 'react';
import './Message.css';

const Message = ({ message, isCurrentUser }) => {
  return (
    <div className={`message ${isCurrentUser ? 'current-user' : 'other-user'}`}>
      {!isCurrentUser && (
        <div className="message-username">{message.username}</div>
      )}
      <div className="message-content">
        {message.message}
        <div className="message-time">{message.time}</div>
      </div>
    </div>
  );
};

export default Message;