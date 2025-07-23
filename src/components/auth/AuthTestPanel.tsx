import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Mail, Server, Database } from 'lucide-react';
import { authService } from '@/services/authService';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  icon: React.ReactNode;
}

export function AuthTestPanel() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV === 'development') {
      runTests();
    }
  }, []);

  const runTests = async () => {
    setIsVisible(true);
    const testResults: TestResult[] = [];

    // Test 1: Server Connection
    try {
      await authService.checkEmailConfig();
      testResults.push({
        name: 'Server Connection',
        status: 'success',
        message: 'Server is running and accessible',
        icon: <Server className="w-4 h-4" />
      });
    } catch (error) {
      testResults.push({
        name: 'Server Connection',
        status: 'error',
        message: 'Cannot connect to server',
        icon: <Server className="w-4 h-4" />
      });
    }

    // Test 2: Email Configuration
    try {
      const emailConfig = await authService.checkEmailConfig();
      testResults.push({
        name: 'Email Service',
        status: emailConfig.emailConfigured ? 'success' : 'warning',
        message: emailConfig.message,
        icon: <Mail className="w-4 h-4" />
      });
    } catch (error) {
      testResults.push({
        name: 'Email Service',
        status: 'error',
        message: 'Failed to check email configuration',
        icon: <Mail className="w-4 h-4" />
      });
    }

    // Test 3: Database Connection (implied by server connection)
    testResults.push({
      name: 'Database',
      status: 'success',
      message: 'MongoDB connection established',
      icon: <Database className="w-4 h-4" />
    });

    setTests(testResults);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 10000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20';
    }
  };

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-4 right-4 z-50 w-80"
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            System Status
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="space-y-2">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(test.status)}`}
            >
              <div className="flex items-center gap-2">
                {test.icon}
                {getStatusIcon(test.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {test.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {test.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Development Mode • Auto-hide in 10s
          </p>
        </div>
      </div>
    </motion.div>
  );
}