import { useEffect, useState } from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthTestPanel } from '@/components/auth/AuthTestPanel';
import { useChatStore } from '@/stores/chatStore';
import { authService } from '@/services/authService';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

const Index = () => {
  const { currentUser, isConnected, initializeSocket, connectAsUser } = useChatStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthStatus = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getProfile();
          handleAuthSuccess(response.user);
        } catch (error) {
          // Token might be expired, remove it
          authService.removeToken();
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && currentUser) {
      // Initialize socket connection only after authentication
      initializeSocket();
      setIsInitialized(true);
    }
  }, [initializeSocket, isCheckingAuth, currentUser]);

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

  const handleAuthSuccess = (userData: any) => {
    // Connect to socket with authenticated user data
    connectAsUser({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar
    });
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ChatApp
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthContainer onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <ChatLayout />
      <AuthTestPanel />
      <Toaster position="top-right" />
    </>
  );
};

export default Index;
