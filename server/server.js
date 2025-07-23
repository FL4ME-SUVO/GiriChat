import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { generateToken, authMiddleware } from './utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './utils/email.js';

dotenv.config();

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp')
  .then(() => console.log('📦 Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Try to send verification email
    let emailSent = false;
    try {
      // Check if email is configured
      if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-email@gmail.com') {
        await sendVerificationEmail(email, username, verificationToken);
        emailSent = true;
        console.log(`Verification email sent to ${email} with code: ${verificationToken}`);
      } else {
        console.log(`Email not configured. Verification code for ${email}: ${verificationToken}`);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      console.log(`Verification code for ${email}: ${verificationToken}`);
    }

    res.status(201).json({
      message: emailSent 
        ? 'Registration successful! Please check your email for verification code.'
        : `Registration successful! Your verification code is: ${verificationToken} (Email service not configured)`,
      userId: user._id,
      requiresVerification: true,
      verificationCode: !emailSent ? verificationToken : undefined // Only send code if email failed
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationToken: verificationCode,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        error: 'Please verify your email before logging in',
        requiresVerification: true,
        userId: user._id
      });
    }

    const token = generateToken(user._id);

    // Update user status
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    // Try to send password reset email
    let emailSent = false;
    try {
      // Check if email is configured
      if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-email@gmail.com') {
        await sendPasswordResetEmail(email, user.username, resetToken);
        emailSent = true;
        console.log(`Password reset email sent to ${email} with code: ${resetToken}`);
      } else {
        console.log(`Email not configured. Password reset code for ${email}: ${resetToken}`);
      }
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
      console.log(`Password reset code for ${email}: ${resetToken}`);
    }

    res.json({ 
      message: emailSent 
        ? 'Password reset code sent to your email!'
        : `Password reset code: ${resetToken} (Email service not configured)`,
      resetCode: !emailSent ? resetToken : undefined // Only send code if email failed
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request. Please try again.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    const user = await User.findOne({
      email,
      passwordResetToken: resetCode,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now login with your new password.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
});

app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    try {
      await sendVerificationEmail(email, user.username, verificationToken);
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }

    res.json({ message: 'Verification code sent to your email!' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification. Please try again.' });
  }
});

// Protected route to get user profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Check email configuration status
app.get('/api/auth/email-config', (req, res) => {
  const isEmailConfigured = process.env.EMAIL_USER && 
                           process.env.EMAIL_USER !== 'your-email@gmail.com' &&
                           process.env.EMAIL_PASS &&
                           process.env.EMAIL_PASS !== 'your-app-password';
  
  res.json({
    emailConfigured: isEmailConfigured,
    message: isEmailConfigured 
      ? 'Email service is configured' 
      : 'Email service not configured - running in development mode'
  });
});

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
  socket.on('user:join', async (userData) => {
    try {
      // Find user in database
      let user = await User.findById(userData.id);
      
      if (!user) {
        // Fallback for users not in database (temporary compatibility)
        user = {
          id: userData.id || uuidv4(),
          username: userData.username,
          avatar: userData.avatar,
          status: 'online',
          socketId: socket.id
        };
      } else {
        // Update user status and socket ID
        user.status = 'online';
        user.socketId = socket.id;
        user.lastSeen = new Date();
        await user.save();
        
        // Convert to plain object for consistency
        user = {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          status: user.status,
          socketId: socket.id
        };
      }

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
    } catch (error) {
      console.error('Error handling user join:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
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