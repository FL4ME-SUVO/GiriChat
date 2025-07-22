import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
const users = new Map();
const channels = new Map();
const messages = new Map();
const typingUsers = new Map();

// Initialize default channels
const defaultChannels = [
  {
    id: 'general',
    name: 'General',
    type: 'public',
    description: 'General discussion',
    members: [],
    unreadCount: 0
  },
  {
    id: 'random',
    name: 'Random',
    type: 'public',
    description: 'Random conversations',
    members: [],
    unreadCount: 0
  }
];

defaultChannels.forEach(channel => {
  channels.set(channel.id, channel);
  messages.set(channel.id, []);
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('user:join', (userData) => {
    const user = {
      id: userData.id || uuidv4(),
      username: userData.username,
      avatar: userData.avatar,
      status: 'online',
      socketId: socket.id
    };

    users.set(user.id, user);
    socket.userId = user.id;

    // Join default channels
    defaultChannels.forEach(channel => {
      socket.join(channel.id);
      const channelData = channels.get(channel.id);
      if (!channelData.members.includes(user.id)) {
        channelData.members.push(user.id);
        channels.set(channel.id, channelData);
      }
    });

    // Send current user data
    socket.emit('user:joined', user);

    // Send initial data
    socket.emit('channels:list', Array.from(channels.values()));
    socket.emit('users:list', Array.from(users.values()));

    // Send message history for each channel
    channels.forEach((channel, channelId) => {
      const channelMessages = messages.get(channelId) || [];
      socket.emit('messages:history', { channelId, messages: channelMessages });
    });

    // Broadcast user joined to others
    socket.broadcast.emit('user:online', user);

    console.log(`User ${user.username} joined with ID: ${user.id}`);
  });

  // Handle sending messages
  socket.on('message:send', (messageData) => {
    const user = users.get(socket.userId);
    if (!user) return;

    const message = {
      id: uuidv4(),
      content: messageData.content,
      senderId: user.id,
      channelId: messageData.channelId,
      timestamp: new Date(),
      type: messageData.type || 'text',
      status: 'sent',
      fileUrl: messageData.fileUrl,
      fileName: messageData.fileName,
      reactions: []
    };

    // Store message
    const channelMessages = messages.get(messageData.channelId) || [];
    channelMessages.push(message);
    messages.set(messageData.channelId, channelMessages);

    // Send to all users in the channel
    io.to(messageData.channelId).emit('message:new', message);

    // Update message status to delivered
    setTimeout(() => {
      message.status = 'delivered';
      io.to(messageData.channelId).emit('message:status', {
        messageId: message.id,
        status: 'delivered'
      });
    }, 100);

    console.log(`Message sent in ${messageData.channelId} by ${user.username}: ${message.content}`);
  });

  // Handle typing indicators
  socket.on('typing:start', (data) => {
    const user = users.get(socket.userId);
    if (!user) return;

    const channelTyping = typingUsers.get(data.channelId) || new Set();
    channelTyping.add(user.id);
    typingUsers.set(data.channelId, channelTyping);

    socket.to(data.channelId).emit('typing:user', {
      channelId: data.channelId,
      userId: user.id,
      username: user.username,
      isTyping: true
    });
  });

  socket.on('typing:stop', (data) => {
    const user = users.get(socket.userId);
    if (!user) return;

    const channelTyping = typingUsers.get(data.channelId) || new Set();
    channelTyping.delete(user.id);
    typingUsers.set(data.channelId, channelTyping);

    socket.to(data.channelId).emit('typing:user', {
      channelId: data.channelId,
      userId: user.id,
      username: user.username,
      isTyping: false
    });
  });

  // Handle reactions
  socket.on('reaction:add', (data) => {
    const user = users.get(socket.userId);
    if (!user) return;

    const channelMessages = messages.get(data.channelId) || [];
    const messageIndex = channelMessages.findIndex(m => m.id === data.messageId);
    
    if (messageIndex !== -1) {
      const message = channelMessages[messageIndex];
      const existingReaction = message.reactions.find(
        r => r.emoji === data.emoji && r.userId === user.id
      );

      if (!existingReaction) {
        message.reactions.push({
          emoji: data.emoji,
          userId: user.id,
          username: user.username
        });
      } else {
        // Remove reaction if it already exists
        message.reactions = message.reactions.filter(
          r => !(r.emoji === data.emoji && r.userId === user.id)
        );
      }

      messages.set(data.channelId, channelMessages);

      // Broadcast reaction update
      io.to(data.channelId).emit('reaction:updated', {
        messageId: data.messageId,
        reactions: message.reactions
      });
    }
  });

  // Handle user status changes
  socket.on('user:status', (status) => {
    const user = users.get(socket.userId);
    if (!user) return;

    user.status = status;
    users.set(socket.userId, user);

    // Broadcast status change
    io.emit('user:status:changed', {
      userId: user.id,
      status: status
    });
  });

  // Handle creating new channels
  socket.on('channel:create', (channelData) => {
    const user = users.get(socket.userId);
    if (!user) return;

    const channel = {
      id: uuidv4(),
      name: channelData.name,
      type: channelData.type,
      description: channelData.description,
      members: [user.id, ...channelData.members],
      unreadCount: 0
    };

    channels.set(channel.id, channel);
    messages.set(channel.id, []);

    // Join creator to channel
    socket.join(channel.id);

    // Join other members to channel
    channel.members.forEach(memberId => {
      const memberUser = Array.from(users.values()).find(u => u.id === memberId);
      if (memberUser && memberUser.socketId) {
        io.sockets.sockets.get(memberUser.socketId)?.join(channel.id);
      }
    });

    // Broadcast new channel to members
    channel.members.forEach(memberId => {
      const memberUser = Array.from(users.values()).find(u => u.id === memberId);
      if (memberUser && memberUser.socketId) {
        io.to(memberUser.socketId).emit('channel:created', channel);
      }
    });

    console.log(`Channel ${channel.name} created by ${user.username}`);
  });

  // Handle joining channels
  socket.on('channel:join', (channelId) => {
    const user = users.get(socket.userId);
    const channel = channels.get(channelId);
    
    if (!user || !channel) return;

    socket.join(channelId);
    
    if (!channel.members.includes(user.id)) {
      channel.members.push(user.id);
      channels.set(channelId, channel);
    }

    // Send message history
    const channelMessages = messages.get(channelId) || [];
    socket.emit('messages:history', { channelId, messages: channelMessages });

    console.log(`User ${user.username} joined channel ${channel.name}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.userId);
    if (user) {
      user.status = 'offline';
      user.lastSeen = new Date();
      users.set(socket.userId, user);

      // Clear typing indicators
      typingUsers.forEach((typingSet, channelId) => {
        if (typingSet.has(user.id)) {
          typingSet.delete(user.id);
          socket.to(channelId).emit('typing:user', {
            channelId,
            userId: user.id,
            username: user.username,
            isTyping: false
          });
        }
      });

      // Broadcast user offline
      socket.broadcast.emit('user:offline', {
        userId: user.id,
        lastSeen: user.lastSeen
      });

      console.log(`User ${user.username} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
});