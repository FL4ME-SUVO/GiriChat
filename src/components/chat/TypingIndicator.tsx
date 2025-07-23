import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/stores/chatStore';

interface TypingIndicatorProps {
  userIds: string[];
  users: User[];
  currentUserId?: string;
}

export function TypingIndicator({ userIds, users, currentUserId }: TypingIndicatorProps) {
  const typingUsers = users.filter(user => 
    userIds.includes(user.id) && user.id !== currentUserId
  );

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    } else {
      return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 px-3 py-2"
    >
      {/* Avatars */}
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.id} className="h-6 w-6 border-2 border-white dark:border-gray-800">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Typing Text and Animation */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getTypingText()}
        </span>
        
        {/* Animated Dots */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}