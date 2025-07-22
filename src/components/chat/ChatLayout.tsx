import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { UserPanel } from './UserPanel';

export function ChatLayout() {
  const { theme, sidebarCollapsed } = useChatStore();

  useEffect(() => {
    // Apply theme on mount
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex h-screen bg-chat-bg text-foreground overflow-hidden relative">
      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-50">
        <ConnectionStatus />
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarCollapsed ? '72px' : '280px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-shrink-0 border-r border-border"
      >
        <Sidebar />
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <ChatArea />
      </div>

      {/* User Panel - Hidden on mobile */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarCollapsed ? '0px' : '280px',
          opacity: sidebarCollapsed ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block flex-shrink-0 border-l border-border overflow-hidden"
      >
        <UserPanel />
      </motion.div>
    </div>
  );
}