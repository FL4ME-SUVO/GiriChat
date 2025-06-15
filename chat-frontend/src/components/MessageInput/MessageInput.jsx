// src/components/MessageInput/MessageInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import FileUploadModal from '../FileUploadModal/FileUploadModal';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('File upload failed');
      }
      
      const data = await response.json();
      const fileUrl = data.url;
      
      // Send file as a special message
      onSendMessage('', fileUrl, file.name, file.type);
    } catch (error) {
      console.error('Upload error:', error);
      // Handle error (show notification, etc.)
    } finally {
      setIsUploading(false);
    }
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
        <button 
          type="button" 
          className="attach-button"
          onClick={() => setShowUploadModal(true)}
          disabled={isUploading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
          </svg>
        </button>
        
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type a message..."
          onBlur={handleStopTyping}
          disabled={isUploading}
        />
        
        <button 
          type="submit" 
          disabled={(!message.trim() && !isUploading) || isUploading}
        >
          {isUploading ? (
            <div className="spinner"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          )}
        </button>
      </div>
      
      {showUploadModal && (
        <FileUploadModal 
          onClose={() => setShowUploadModal(false)}
          onFileSelect={handleFileSelect}
        />
      )}
    </form>
  );
};

export default MessageInput;