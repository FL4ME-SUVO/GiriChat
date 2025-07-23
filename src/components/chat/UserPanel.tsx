import { motion } from 'framer-motion';
import { Search, UserPlus, Crown, Shield, User as UserIcon } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function UserPanel() {
  const { channels, activeChannelId, users } = useChatStore();
  const activeChannel = channels.find(c => c.id === activeChannelId);

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-gray-500 dark:text-gray-400"
        >
          <UserIcon className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-sm">Select a channel to see members</p>
        </motion.div>
      </div>
    );
  }

  const channelMembers = users.filter(user => activeChannel.members.includes(user.id));
  const onlineMembers = channelMembers.filter(user => user.status === 'online');
  const offlineMembers = channelMembers.filter(user => user.status !== 'online');

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

  const getRoleIcon = (userId: string) => {
    // Mock role system - in a real app this would come from the database
    if (userId === '1') return <Crown className="h-3 w-3 text-yellow-500" />;
    if (userId === '2') return <Shield className="h-3 w-3 text-blue-500" />;
    return null;
  };

  const getRoleName = (userId: string) => {
    if (userId === '1') return 'Owner';
    if (userId === '2') return 'Admin';
    return 'Member';
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Members</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <UserPlus className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search members..."
            className="pl-9 h-9 bg-gray-100/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:ring-blue-500 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {onlineMembers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Online</h3>
              <Badge variant="secondary" className="h-5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                {onlineMembers.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {onlineMembers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {user.username.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800",
                      getStatusColor(user.status)
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.username}
                      </span>
                      {getRoleIcon(user.id)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 dark:text-green-400 capitalize">
                        {user.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getRoleName(user.id)}
                      </span>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                    <UserIcon className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {offlineMembers.length > 0 && onlineMembers.length > 0 && (
          <Separator />
        )}

        {offlineMembers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Offline</h3>
              <Badge variant="outline" className="h-5 text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                {offlineMembers.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {offlineMembers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100/30 dark:hover:bg-gray-800/30 cursor-pointer transition-all duration-200 opacity-60 hover:opacity-80"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 grayscale">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs bg-gray-400 text-white">
                        {user.username.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800",
                      getStatusColor(user.status)
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {user.username}
                      </span>
                      {getRoleIcon(user.id)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Last seen {Math.floor(Math.random() * 12) + 1}h ago
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeChannel.type === 'public' && (
          <>
            <Separator />
            <div className="text-center">
              <Button variant="outline" size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Members
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}