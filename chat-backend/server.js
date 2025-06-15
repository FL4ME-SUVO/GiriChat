// chat-backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Track typing users
const typingUsers = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { room, username } = data;
    typingUsers[socket.id] = username;
    socket.to(room).emit('typing', username);
  });

  socket.on('stop_typing', (data) => {
    const { room } = data;
    delete typingUsers[socket.id];
    socket.to(room).emit('stop_typing', Object.values(typingUsers));
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete typingUsers[socket.id];
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});