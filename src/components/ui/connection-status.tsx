import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export function ConnectionStatus() {
  const { isConnected } = useChatStore();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-xl border
          ${isConnected 
            ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30' 
            : 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
          }
        `}
      >
        <motion.div
          animate={isConnected ? {} : { rotate: 360 }}
          transition={{ duration: 2, repeat: isConnected ? 0 : Infinity, ease: "linear" }}
        >
          {isConnected ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
        </motion.div>
        
        <span className="hidden sm:inline">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>

        {isConnected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}