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
      <div className="flex items-center justify-center h-full bg-chat-bg">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to ChatterVerse</h2>
          <p className="text-muted-foreground">Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  const Icon = getChannelIcon(activeChannel.type);
  const onlineMembers = getOnlineMembers();

  return (
    <div className="flex flex-col h-full bg-chat-bg">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-border bg-card"
      >
        <div className="flex items-center gap-3">
          {activeChannel.type === 'dm' && activeChannel.avatar ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={activeChannel.avatar} />
              <AvatarFallback>
                {activeChannel.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
          
          <div>
            <h1 className="font-semibold text-foreground">{activeChannel.name}</h1>
            {activeChannel.description && (
              <p className="text-sm text-muted-foreground">{activeChannel.description}</p>
            )}
            {onlineMembers.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {onlineMembers.length} member{onlineMembers.length !== 1 ? 's' : ''} online
              </p>
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
      <div className="border-t border-border bg-card">
        <MessageInput />
      </div>
    </div>
  );
}