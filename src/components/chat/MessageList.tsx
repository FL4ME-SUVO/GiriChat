import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Clock, AlertCircle, Smile, Reply, MoreHorizontal } from 'lucide-react';
import { Message, useChatStore } from '@/stores/chatStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
}

interface MessageItemProps {
  message: Message;
  showAvatar: boolean;
  isConsecutive: boolean;
}

const MessageItem = memo(({ message, showAvatar, isConsecutive }: MessageItemProps) => {
  const { users, currentUser, addReaction } = useChatStore();
  const sender = users.find(u => u.id === message.senderId);
  const isOwnMessage = message.senderId === currentUser?.id;

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return <AlertCircle className="h-3 w-3 text-destructive" />;
    }
  };

  const handleEmojiClick = (emoji: string) => {
    addReaction(message.id, emoji);
  };

  const reactionCounts = message.reactions?.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex gap-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-all duration-200",
        !showAvatar && "mt-1"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10">
        {showAvatar && sender && (
          <Avatar className="h-10 w-10">
            <AvatarImage src={sender.avatar} />
            <AvatarFallback>
              {sender.username.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-foreground">
              {sender?.username || 'Unknown User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn(
          "relative group/message",
          isOwnMessage ? "flex justify-end" : ""
        )}>
          <div className={cn(
            "max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-3 break-words shadow-sm",
            isOwnMessage 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto" 
              : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100",
            message.type === 'system' && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-center italic"
          )}>
            {message.type === 'image' && message.fileUrl && (
              <div className="mb-2">
                <img 
                  src={message.fileUrl} 
                  alt="Shared image"
                  className="rounded-lg max-w-full h-auto"
                />
              </div>
            )}

            {message.type === 'file' && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg mb-2">
                <div className="text-sm">
                  📎 {message.fileName || 'File attachment'}
                </div>
              </div>
            )}

            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

            {/* Status indicator for own messages */}
            {isOwnMessage && (
              <div className="flex justify-end mt-1">
                {getStatusIcon()}
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className="opacity-0 group-hover/message:opacity-100 transition-opacity absolute -top-8 right-0 flex items-center gap-1 bg-popover border rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleEmojiClick('👍')}
            >
              <span className="text-sm">👍</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleEmojiClick('❤️')}
            >
              <span className="text-sm">❤️</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleEmojiClick('😂')}
            >
              <span className="text-sm">😂</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
            >
              <Reply className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(reactionCounts).map(([emoji, count]) => {
              const hasReacted = message.reactions?.some(
                r => r.emoji === emoji && r.userId === currentUser?.id
              );
              
              return (
                <motion.button
                  key={emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEmojiClick(emoji)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                    hasReacted
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted hover:bg-muted/80 border"
                  )}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
});

MessageItem.displayName = 'MessageItem';

export const MessageList = memo(({ messages }: MessageListProps) => {
  return (
    <AnimatePresence>
      {messages.map((message, index) => {
        const prevMessage = messages[index - 1];
        const showAvatar = !prevMessage || 
          prevMessage.senderId !== message.senderId ||
          message.timestamp.getTime() - prevMessage.timestamp.getTime() > 300000; // 5 minutes
        
        const isConsecutive = prevMessage && 
          prevMessage.senderId === message.senderId &&
          message.timestamp.getTime() - prevMessage.timestamp.getTime() < 300000;

        return (
          <MessageItem
            key={message.id}
            message={message}
            showAvatar={showAvatar}
            isConsecutive={isConsecutive}
          />
        );
      })}
    </AnimatePresence>
  );
});

MessageList.displayName = 'MessageList';