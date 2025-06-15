// src/components/Message/Message.jsx
import React from 'react';
import './Message.css';

const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎬';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
  return '📁';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Message = ({ message, isCurrentUser }) => {
  const isFileMessage = message.fileUrl;
  
  return (
    <div className={`message ${isCurrentUser ? 'current-user' : 'other-user'}`}>
      {!isCurrentUser && (
        <div className="message-username">{message.username}</div>
      )}
      <div className="message-content">
        {isFileMessage ? (
          <a 
            href={message.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="file-message"
          >
            <div className="file-icon">{getFileIcon(message.fileType)}</div>
            <div className="file-details">
              <div className="file-name">{message.fileName}</div>
              {message.fileType.startsWith('image/') ? (
                <img 
                  src={message.fileUrl} 
                  alt="Sent file" 
                  className="file-preview-image"
                />
              ) : (
                <div className="file-info">
                  <span className="file-type">{message.fileType.split('/')[1] || message.fileType}</span>
                  <span className="file-size">{formatFileSize(message.fileSize)}</span>
                </div>
              )}
            </div>
          </a>
        ) : (
          message.message
        )}
        <div className="message-time">{message.time}</div>
      </div>
    </div>
  );
};

export default Message;