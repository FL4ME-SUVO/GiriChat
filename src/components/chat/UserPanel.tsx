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
        <div className="text-center text-muted-foreground">
          <UserIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Select a channel to see members</p>
        </div>
      </div>
    );
  }

  const channelMembers = users.filter(user => activeChannel.members.includes(user.id));
  const onlineMembers = channelMembers.filter(user => user.status === 'online');
  const offlineMembers = channelMembers.filter(user => user.status !== 'online');

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
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Members</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {onlineMembers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-foreground">Online</h3>
              <Badge variant="secondary" className="h-5 text-xs">
                {onlineMembers.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {onlineMembers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.username.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                      getStatusColor(user.status)
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {user.username}
                      </span>
                      {getRoleIcon(user.id)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
              <h3 className="text-sm font-medium text-muted-foreground">Offline</h3>
              <Badge variant="outline" className="h-5 text-xs">
                {offlineMembers.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {offlineMembers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors opacity-60"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.username.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                      getStatusColor(user.status)
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {user.username}
                      </span>
                      {getRoleIcon(user.id)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
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