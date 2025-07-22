import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { socketService } from '@/services/socketService';

export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  reactions?: Reaction[];
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
  username: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'dm' | 'group' | 'public' | 'private';
  description?: string;
  avatar?: string;
  members: string[];
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: string[];
}

interface ChatState {
  currentUser: User | null;
  users: User[];
  channels: Channel[];
  messages: Record<string, Message[]>;
  activeChannelId: string | null;
  searchQuery: string;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  isConnected: boolean;
  typingUsers: Record<string, string[]>;
}

interface ChatActions {
  setCurrentUser: (user: User) => void;
  setActiveChannel: (channelId: string) => void;
  sendMessage: (content: string, type?: Message['type'], fileUrl?: string, fileName?: string) => void;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  setUserStatus: (userId: string, status: User['status']) => void;
  setTyping: (channelId: string, userId: string, isTyping: boolean) => void;
  markChannelAsRead: (channelId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setConnected: (connected: boolean) => void;
  createChannel: (name: string, type: Channel['type'], members: string[]) => void;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    status: 'online'
  },
  {
    id: '2',
    username: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'away'
  },
  {
    id: '3',
    username: 'Jordan Kim',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'online'
  },
  {
    id: '4',
    username: 'Maya Patel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'busy'
  }
];

const mockChannels: Channel[] = [
  {
    id: 'general',
    name: 'General',
    type: 'public',
    description: 'General discussion',
    members: ['1', '2', '3', '4'],
    unreadCount: 0
  },
  {
    id: 'random',
    name: 'Random',
    type: 'public',
    description: 'Random conversations',
    members: ['1', '2', '3', '4'],
    unreadCount: 2
  },
  {
    id: 'dm-sarah',
    name: 'Sarah Chen',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    members: ['1', '4'],
    unreadCount: 1
  },
  {
    id: 'team-design',
    name: 'Design Team',
    type: 'private',
    description: 'Design team discussions',
    members: ['1', '3', '4'],
    unreadCount: 0
  }
];

const mockMessages: Record<string, Message[]> = {
  'general': [
    {
      id: '1',
      content: 'Hey everyone! Welcome to our new chat app! 🎉',
      senderId: '1',
      channelId: 'general',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      status: 'read',
      reactions: [
        { emoji: '🎉', userId: '2', username: 'Alex Rivera' },
        { emoji: '👋', userId: '3', username: 'Jordan Kim' }
      ]
    },
    {
      id: '2',
      content: 'This looks amazing! Great work on the UI design.',
      senderId: '2',
      channelId: 'general',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      content: 'I love the dark mode toggle! Very smooth animations too.',
      senderId: '3',
      channelId: 'general',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
      status: 'read'
    },
    {
      id: '4',
      content: 'Should we add voice calling next? 📞',
      senderId: '4',
      channelId: 'general',
      timestamp: new Date(Date.now() - 900000),
      type: 'text',
      status: 'delivered'
    }
  ],
  'random': [
    {
      id: '5',
      content: 'Anyone tried the new coffee place downtown?',
      senderId: '2',
      channelId: 'random',
      timestamp: new Date(Date.now() - 7200000),
      type: 'text',
      status: 'read'
    }
  ],
  'dm-sarah': [
    {
      id: '6',
      content: 'Hey! Can we discuss the project timeline?',
      senderId: '1',
      channelId: 'dm-sarah',
      timestamp: new Date(Date.now() - 1200000),
      type: 'text',
      status: 'delivered'
    }
  ]
};

interface ChatStoreWithSocket extends ChatState, ChatActions {
  initializeSocket: () => void;
  connectAsUser: (userData: Partial<User>) => void;
  disconnectSocket: () => void;
}

export const useChatStore = create<ChatStoreWithSocket>()(
  devtools((set, get) => ({
    // State
    currentUser: null,
    users: [],
    channels: [],
    messages: {},
    activeChannelId: null,
    searchQuery: '',
    theme: 'light',
    sidebarCollapsed: false,
    isConnected: false,
    typingUsers: {},

    // Socket initialization
    initializeSocket: () => {
      const socket = socketService.connect();
      
      // Set up all socket event listeners
      socketService.onUserJoined((user) => {
        set({ currentUser: user, isConnected: true });
      });

      socketService.onUsersList((users) => {
        set({ users });
      });

      socketService.onChannelsList((channels) => {
        set({ channels });
        // Set first channel as active if none selected
        if (!get().activeChannelId && channels.length > 0) {
          set({ activeChannelId: channels[0].id });
        }
      });

      socketService.onChannelCreated((channel) => {
        set((state) => ({
          channels: [...state.channels, channel]
        }));
      });

      socketService.onNewMessage((message) => {
        // Convert timestamp string to Date object
        const messageWithDate = {
          ...message,
          timestamp: new Date(message.timestamp)
        };
        
        set((state) => ({
          messages: {
            ...state.messages,
            [message.channelId]: [...(state.messages[message.channelId] || []), messageWithDate]
          }
        }));

        // Update unread count if not active channel
        if (message.channelId !== get().activeChannelId) {
          set((state) => ({
            channels: state.channels.map(channel =>
              channel.id === message.channelId 
                ? { ...channel, unreadCount: channel.unreadCount + 1 }
                : channel
            )
          }));
        }
      });

      socketService.onMessagesHistory(({ channelId, messages }) => {
        const messagesWithDates = messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        set((state) => ({
          messages: {
            ...state.messages,
            [channelId]: messagesWithDates
          }
        }));
      });

      socketService.onMessageStatus(({ messageId, status }) => {
        get().updateMessageStatus(messageId, status);
      });

      socketService.onUserOnline((user) => {
        set((state) => ({
          users: state.users.some(u => u.id === user.id)
            ? state.users.map(u => u.id === user.id ? { ...u, status: 'online' } : u)
            : [...state.users, user]
        }));
      });

      socketService.onUserOffline(({ userId, lastSeen }) => {
        set((state) => ({
          users: state.users.map(user =>
            user.id === userId 
              ? { ...user, status: 'offline' as const, lastSeen: new Date(lastSeen) }
              : user
          )
        }));
      });

      socketService.onUserStatusChanged(({ userId, status }) => {
        get().setUserStatus(userId, status);
      });

      socketService.onTypingUser(({ channelId, userId, isTyping }) => {
        get().setTyping(channelId, userId, isTyping);
      });

      socketService.onReactionUpdated(({ messageId, reactions }) => {
        set((state) => {
          const newMessages = { ...state.messages };
          Object.keys(newMessages).forEach(channelId => {
            newMessages[channelId] = newMessages[channelId].map(msg =>
              msg.id === messageId ? { ...msg, reactions } : msg
            );
          });
          return { messages: newMessages };
        });
      });

      // Handle connection status
      socket.on('connect', () => {
        set({ isConnected: true });
      });

      socket.on('disconnect', () => {
        set({ isConnected: false });
      });
    },

    connectAsUser: (userData) => {
      socketService.joinAsUser(userData);
    },

    disconnectSocket: () => {
      socketService.disconnect();
      set({ isConnected: false });
    },

    // Actions
    setCurrentUser: (user) => set({ currentUser: user }),

    setActiveChannel: (channelId) => {
      set({ activeChannelId: channelId });
      get().markChannelAsRead(channelId);
      socketService.joinChannel(channelId);
    },

    sendMessage: (content, type = 'text', fileUrl, fileName) => {
      const { activeChannelId } = get();
      if (!activeChannelId) return;

      // Send via socket instead of local state
      socketService.sendMessage(activeChannelId, content, type, fileUrl, fileName);
    },

    addMessage: (message) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [message.channelId]: [...(state.messages[message.channelId] || []), message]
        }
      }));
    },

    updateMessageStatus: (messageId, status) => {
      set((state) => {
        const newMessages = { ...state.messages };
        Object.keys(newMessages).forEach(channelId => {
          newMessages[channelId] = newMessages[channelId].map(msg =>
            msg.id === messageId ? { ...msg, status } : msg
          );
        });
        return { messages: newMessages };
      });
    },

    addReaction: (messageId, emoji) => {
      const { activeChannelId } = get();
      if (!activeChannelId) return;

      // Send reaction via socket
      socketService.addReaction(activeChannelId, messageId, emoji);
    },

    removeReaction: (messageId, emoji) => {
      const { activeChannelId } = get();
      if (!activeChannelId) return;

      // Send reaction removal via socket
      socketService.addReaction(activeChannelId, messageId, emoji);
    },

    setUserStatus: (userId, status) => {
      set((state) => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, status } : user
        )
      }));

      // Update own status via socket
      const { currentUser } = get();
      if (currentUser && userId === currentUser.id) {
        socketService.setUserStatus(status);
      }
    },

    setTyping: (channelId, userId, isTyping) => {
      set((state) => {
        const typingUsers = { ...state.typingUsers };
        if (!typingUsers[channelId]) {
          typingUsers[channelId] = [];
        }
        
        if (isTyping) {
          if (!typingUsers[channelId].includes(userId)) {
            typingUsers[channelId].push(userId);
          }
        } else {
          typingUsers[channelId] = typingUsers[channelId].filter(id => id !== userId);
        }
        
        return { typingUsers };
      });
    },

    markChannelAsRead: (channelId) => {
      set((state) => ({
        channels: state.channels.map(channel =>
          channel.id === channelId ? { ...channel, unreadCount: 0 } : channel
        )
      }));
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        return { theme: newTheme };
      });
    },

    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    setConnected: (connected) => set({ isConnected: connected }),

    createChannel: (name, type, members) => {
      socketService.createChannel(name, type, undefined, members);
    }
  }))
);