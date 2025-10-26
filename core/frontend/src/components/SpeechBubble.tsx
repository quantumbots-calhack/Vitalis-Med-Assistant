'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'default' | 'thinking' | 'error' | 'success';
  autoHide?: boolean;
  onComplete?: () => void;
}

export default function SpeechBubble({
  children,
  className = '',
  delay = 0.3,
  duration = 0.5,
  type = 'default',
  autoHide = false,
  onComplete,
}: SpeechBubbleProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(
        () => {
          setIsVisible(false);
          onComplete?.();
        },
        duration * 1000 + delay * 1000 + 2000
      ); // Show for 2 seconds after animation

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, delay, onComplete]);

  const bubbleVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration,
        ease: 'easeOut' as const,
        delay,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: {
        duration: 0.3,
        ease: 'easeIn' as const,
      },
    },
  };

  // Type-specific styling
  const typeStyles = {
    default: 'bg-background border-primary/20',
    thinking:
      'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-700',
    error: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-700',
    success:
      'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-700',
  };

  const tailStyles = {
    default: 'border-primary/20',
    thinking: 'border-blue-200 dark:border-blue-700',
    error: 'border-red-200 dark:border-red-700',
    success: 'border-green-200 dark:border-green-700',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`relative ${className}`}
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Speech bubble */}
          <motion.div
            className={`${typeStyles[type]} border-2 rounded-2xl p-4 shadow-lg relative`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-foreground text-sm leading-relaxed">
              {children}
            </p>

            {/* Speech bubble tail */}
            <div
              className={`absolute -bottom-2 left-8 w-4 h-4 bg-background border-r-2 border-b-2 ${tailStyles[type]} transform rotate-45`}
            ></div>

            {/* Add subtle animation for thinking type */}
            {type === 'thinking' && (
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
