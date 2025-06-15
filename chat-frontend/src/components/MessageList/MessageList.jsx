import React, { useEffect, useRef } from 'react';
import Message from '../Message/Message';
import './MessageList.css';

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <Message 
          key={index} 
          message={msg} 
          isCurrentUser={msg.username === currentUser} 
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;