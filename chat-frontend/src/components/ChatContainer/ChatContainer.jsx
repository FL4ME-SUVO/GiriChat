import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import MessageList from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';
import StatusBar from '../StatusBar/StatusBar';
import './ChatContainer.css';

const ChatContainer = ({ userData }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.emit('join_room', userData.room);

    socketRef.current.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('typing', (username) => {
      setTypingUsers(prev => 
        prev.includes(username) ? prev : [...prev, username]
      );
    });

    socketRef.current.on('stop_typing', (usernames) => {
      setTypingUsers(usernames);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userData.room]);

  const sendMessage = (message) => {
    if (message.trim() && socketRef.current) {
      const messageData = {
        room: userData.room,
        username: userData.username,
        message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socketRef.current.emit('send_message', messageData);
      setMessages(prev => [...prev, messageData]);
    }
  };

  const handleTyping = (isTyping) => {
    if (socketRef.current) {
      if (isTyping) {
        socketRef.current.emit('typing', {
          room: userData.room,
          username: userData.username
        });
      } else {
        socketRef.current.emit('stop_typing', {
          room: userData.room,
          username: userData.username
        });
      }
    }
  };

  return (
    <div className="chat-container glass">
      <StatusBar 
        room={userData.room} 
        typingUsers={typingUsers} 
      />
      <MessageList 
        messages={messages} 
        currentUser={userData.username} 
      />
      <MessageInput 
        onSendMessage={sendMessage} 
        onTyping={handleTyping} 
      />
    </div>
  );
};

export default ChatContainer;