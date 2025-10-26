'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isMockMode } from '@/lib/supabase';

export default function MockModeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if we're in mock mode and if banner hasn't been dismissed
    const dismissed = localStorage.getItem('mock-mode-banner-dismissed');
    if (isMockMode() && !dismissed) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setIsVisible(true), 0);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('mock-mode-banner-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-amber-800">
                  Running in Mock Mode
                </span>
                <span className="text-amber-700 ml-2">
                  Supabase environment variables not found. Data will be saved
                  locally.
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
