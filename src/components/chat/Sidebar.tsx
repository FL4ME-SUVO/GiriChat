import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Hash, MessageCircle, Settings, Moon, Sun, Menu, Users } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const {
    channels,
    activeChannelId,
    setActiveChannel,
    currentUser,
    theme,
    toggleTheme,
    sidebarCollapsed,
    toggleSidebar,
    searchQuery,
    setSearchQuery
  } = useChatStore();

  const [showCreateChannel, setShowCreateChannel] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 min-w-0"
              >
                <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  GiriChat
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: sidebarCollapsed ? 0 : 0.1 }}
              className="mt-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-gray-100/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:ring-blue-500 backdrop-blur-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2"
            >
              <div className="flex items-center justify-between px-2 py-1 mb-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Channels
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowCreateChannel(!showCreateChannel)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1 px-2">
          {filteredChannels.map((channel) => {
            const Icon = getChannelIcon(channel.type);
            const isActive = channel.id === activeChannelId;

            return (
              <motion.button
                key={channel.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveChannel(channel.id)}
                className={cn(
                  "flex items-center gap-3 w-full p-2 rounded-lg transition-all duration-200 text-left backdrop-blur-sm",
                  isActive
                    ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:scale-[1.02]"
                )}
              >
                {channel.type === 'dm' && channel.avatar ? (
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={channel.avatar} />
                      <AvatarFallback className="text-xs">
                        {channel.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800",
                      getStatusColor('online')
                    )} />
                  </div>
                ) : (
                  <Icon className="h-4 w-4 flex-shrink-0" />
                )}

                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex items-center justify-between flex-1 min-w-0"
                    >
                      <span className="truncate text-sm font-medium">
                        {channel.name}
                      </span>
                      {channel.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center text-xs">
                          {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                        </Badge>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* User Profile & Settings */}
      <div className="p-4 border-t border-gray-200/20 dark:border-gray-700/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {currentUser && (
            <>
              <div className="relative">
                <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {currentUser.username.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800",
                  getStatusColor(currentUser.status)
                )} />
              </div>

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {currentUser.username}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {currentUser.status}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}