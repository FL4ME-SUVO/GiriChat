import { motion } from 'framer-motion';
import { AlertCircle, Mail, Settings } from 'lucide-react';

export function DevModeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
            Development Mode
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            Email service is not configured. Verification codes will be displayed in the UI and server console.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Mail className="w-3 h-3" />
              <span>Check console for codes</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Settings className="w-3 h-3" />
              <span>See EMAIL_SETUP.md</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}