import { io, Socket } from 'socket.io-client';
import { Message, User, Channel, Reaction } from '@/stores/chatStore';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(serverUrl: string = 'http://localhost:3001') {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to chat server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from chat server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.socket?.connect();
      }, 2000 * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  // User methods
  joinAsUser(userData: Partial<User>) {
    this.socket?.emit('user:join', userData);
  }

  setUserStatus(status: User['status']) {
    this.socket?.emit('user:status', status);
  }

  // Message methods
  sendMessage(channelId: string, content: string, type: Message['type'] = 'text', fileUrl?: string, fileName?: string) {
    this.socket?.emit('message:send', {
      channelId,
      content,
      type,
      fileUrl,
      fileName
    });
  }

  // Typing indicators
  startTyping(channelId: string) {
    this.socket?.emit('typing:start', { channelId });
  }

  stopTyping(channelId: string) {
    this.socket?.emit('typing:stop', { channelId });
  }

  // Reactions
  addReaction(channelId: string, messageId: string, emoji: string) {
    this.socket?.emit('reaction:add', {
      channelId,
      messageId,
      emoji
    });
  }

  // Channel methods
  createChannel(name: string, type: Channel['type'], description?: string, members: string[] = []) {
    this.socket?.emit('channel:create', {
      name,
      type,
      description,
      members
    });
  }

  joinChannel(channelId: string) {
    this.socket?.emit('channel:join', channelId);
  }

  // Event listeners
  onUserJoined(callback: (user: User) => void) {
    this.socket?.on('user:joined', callback);
  }

  onUserOnline(callback: (user: User) => void) {
    this.socket?.on('user:online', callback);
  }

  onUserOffline(callback: (data: { userId: string; lastSeen: Date }) => void) {
    this.socket?.on('user:offline', callback);
  }

  onUserStatusChanged(callback: (data: { userId: string; status: User['status'] }) => void) {
    this.socket?.on('user:status:changed', callback);
  }

  onUsersList(callback: (users: User[]) => void) {
    this.socket?.on('users:list', callback);
  }

  onChannelsList(callback: (channels: Channel[]) => void) {
    this.socket?.on('channels:list', callback);
  }

  onChannelCreated(callback: (channel: Channel) => void) {
    this.socket?.on('channel:created', callback);
  }

  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('message:new', callback);
  }

  onMessageStatus(callback: (data: { messageId: string; status: Message['status'] }) => void) {
    this.socket?.on('message:status', callback);
  }

  onMessagesHistory(callback: (data: { channelId: string; messages: Message[] }) => void) {
    this.socket?.on('messages:history', callback);
  }

  onTypingUser(callback: (data: { channelId: string; userId: string; username: string; isTyping: boolean }) => void) {
    this.socket?.on('typing:user', callback);
  }

  onReactionUpdated(callback: (data: { messageId: string; reactions: Reaction[] }) => void) {
    this.socket?.on('reaction:updated', callback);
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Remove all listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();