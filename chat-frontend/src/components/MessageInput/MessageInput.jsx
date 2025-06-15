import React, { useState, useEffect, useRef } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      if (isTyping) {
        handleStopTyping();
      }
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 2000);
  };

  const handleStopTyping = () => {
    clearTimeout(typingTimeout.current);
    setIsTyping(false);
    onTyping(false);
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);
      if (isTyping) {
        onTyping(false);
      }
    };
  }, [isTyping, onTyping]);

  return (
    <form onSubmit={handleSubmit} className="message-input-container">
      <div className="message-input-wrapper">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type a message..."
          onBlur={handleStopTyping}
        />
        <button type="submit" disabled={!message.trim()}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;