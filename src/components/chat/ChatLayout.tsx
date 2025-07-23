import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 text-foreground overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"
        />
      </div>

      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-50">
        <ConnectionStatus />
      </div>

      {/* Main Layout */}
      <div className="flex w-full h-full relative z-10">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: sidebarCollapsed ? '72px' : '320px'
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0 relative"
        >
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <Sidebar />
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 min-w-0 relative">
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl">
            <ChatArea />
          </div>
        </div>

        {/* User Panel - Hidden on mobile */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '320px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="hidden lg:block flex-shrink-0 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <UserPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}