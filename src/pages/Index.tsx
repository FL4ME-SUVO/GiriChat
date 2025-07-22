import { useEffect, useState } from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useChatStore } from '@/stores/chatStore';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

const Index = () => {
  const { currentUser, isConnected, initializeSocket, connectAsUser } = useChatStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    initializeSocket();
    setIsInitialized(true);
  }, [initializeSocket]);

  useEffect(() => {
    // Show connection status
    if (isInitialized) {
      if (isConnected) {
        toast.success('Connected to chat server', { id: 'connection' });
      } else {
        toast.error('Disconnected from chat server', { id: 'connection' });
      }
    }
  }, [isConnected, isInitialized]);

  const handleLogin = (userData: { username: string; avatar: string }) => {
    connectAsUser(userData);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <>
      <ChatLayout />
      <Toaster position="top-right" />
    </>
  );
};

export default Index;
