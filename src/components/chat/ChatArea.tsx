import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, MessageCircle, Users, MoreHorizontal, Phone, Video, UserPlus } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

export function ChatArea() {
  const {
    activeChannelId,
    channels,
    users,
    messages,
    typingUsers,
    currentUser
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChannel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages[activeChannelId || ''] || [];
  const channelTypingUsers = typingUsers[activeChannelId || ''] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'dm':
        return MessageCircle;
      case 'private':
        return Users;
      default:
        return Hash;
    }
  };

  const getOnlineMembers = () => {
    if (!activeChannel) return [];
    return users.filter(user => 
      activeChannel.members.includes(user.id) && user.status === 'online'
    );
  };

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-full relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="text-6xl mb-6"
          >
            💬
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Welcome to GiriChat
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Select a channel to start your conversation
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-gray-500 dark:text-gray-500"
          >
            Connect • Chat • Collaborate
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const Icon = getChannelIcon(activeChannel.type);
  const onlineMembers = getOnlineMembers();

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
      >
        <div className="flex items-center gap-3">
          {activeChannel.type === 'dm' && activeChannel.avatar ? (
            <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
              <AvatarImage src={activeChannel.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {activeChannel.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">{activeChannel.name}</h1>
            {activeChannel.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{activeChannel.description}</p>
            )}
            {onlineMembers.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {onlineMembers.length} member{onlineMembers.length !== 1 ? 's' : ''} online
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeChannel.type === 'dm' && (
            <>
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="icon">
            <UserPlus className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          <MessageList messages={channelMessages} />
          
          <AnimatePresence>
            {channelTypingUsers.length > 0 && (
              <TypingIndicator 
                userIds={channelTypingUsers}
                users={users}
                currentUserId={currentUser?.id}
              />
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
        <MessageInput />
      </div>
    </div>
  );
}