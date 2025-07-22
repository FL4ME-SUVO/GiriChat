import { motion } from 'framer-motion';
import { User } from '@/stores/chatStore';

interface TypingIndicatorProps {
  userIds: string[];
  users: User[];
  currentUserId?: string;
}

export function TypingIndicator({ userIds, users, currentUserId }: TypingIndicatorProps) {
  const typingUsers = userIds
    .filter(id => id !== currentUserId)
    .map(id => users.find(user => user.id === id))
    .filter(Boolean) as User[];

  if (typingUsers.length === 0) return null;

  const getUsersText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 px-3 py-2"
    >
      <div className="w-10 flex justify-center">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
              animate={{
                y: [-2, 2, -2],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground italic">
        {getUsersText()}
      </div>
    </motion.div>
  );
}