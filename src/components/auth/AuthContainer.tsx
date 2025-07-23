import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { EmailVerificationForm } from './EmailVerificationForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';

type AuthView = 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password';

interface AuthContainerProps {
  onAuthSuccess: (userData: any) => void;
}

export const AuthContainer = ({ onAuthSuccess }: AuthContainerProps) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');

  const handleRegistrationSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentView('verify-email');
  };

  const handleVerificationSuccess = (userData: any) => {
    onAuthSuccess(userData);
  };

  const handleResetCodeSent = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentView('reset-password');
  };

  const handleResetSuccess = () => {
    setCurrentView('login');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onLogin={onAuthSuccess}
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
      
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setCurrentView('login')}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        );
      
      case 'verify-email':
        return (
          <EmailVerificationForm
            email={email}
            onVerificationSuccess={handleVerificationSuccess}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setCurrentView('login')}
            onResetCodeSent={handleResetCodeSent}
          />
        );
      
      case 'reset-password':
        return (
          <ResetPasswordForm
            email={email}
            onResetSuccess={handleResetSuccess}
          />
        );
      
      default:
        return null;
    }
  };

  return renderCurrentView();
};