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
        return 'bg-status-online';
      case 'away':
        return 'bg-status-away';
      case 'busy':
        return 'bg-status-busy';
      default:
        return 'bg-status-offline';
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
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
                <h1 className="font-bold text-lg text-sidebar-foreground truncate">
                  ChatterVerse
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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/60" />
                <Input
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-sidebar-accent border-sidebar-border focus:ring-sidebar-ring"
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
                <span className="text-xs font-semibold text-sidebar-foreground/80 uppercase tracking-wider">
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
                  "flex items-center gap-3 w-full p-2 rounded-lg transition-colors text-left",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
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
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar",
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
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          {currentUser && (
            <>
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>
                    {currentUser.username.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar",
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
                    <div className="text-sm font-medium text-sidebar-foreground truncate">
                      {currentUser.username}
                    </div>
                    <div className="text-xs text-sidebar-foreground/60 capitalize">
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