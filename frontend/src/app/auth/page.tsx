'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageShell from '@/components/PageShell';
import CharacterGif from '@/components/CharacterGif';
import SpeechBubble from '@/components/SpeechBubble';
import LoginForm from '@/components/forms/LoginForm';
import SignupForm from '@/components/forms/SignupForm';
import { useAuthStore } from '@/lib/auth-store';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuthStore();

  const handleAuthSuccess = () => {
    // Check if user has completed onboarding
    if (user?.hasCompletedOnboarding) {
      router.push('/chatbot');
    } else {
      router.push('/onboarding/basic');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const leftColumnVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const rightColumnVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <PageShell>
      <motion.div
        className="container mx-auto px-4 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Vitalis Header */}
        <div className="flex items-center justify-center mb-12">
          <img
            src="/vitalis_logo.png"
            alt="Vitalis Logo"
            className="h-24 w-24"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start min-h-screen">
          {/* Left Column: Character with Speech Bubble */}
          <motion.div
            className="flex flex-col items-center lg:items-start space-y-6 order-2 lg:order-1"
            variants={leftColumnVariants}
          >
            <div className="flex flex-col items-center lg:items-start space-y-1">
              <SpeechBubble className="max-w-sm">
                {isLogin
                  ? "Welcome back to Vitalis! Let's get you signed in to continue your healthcare journey."
                  : "Hello! Let's create your Vitalis account so we can provide personalized medical assistance."}
              </SpeechBubble>

              <CharacterGif
                pose={isLogin ? 'welcome' : 'prompt'}
                size={500}
                ariaLabel={
                  isLogin
                    ? 'Assistant welcoming back user'
                    : 'Assistant helping with signup'
                }
                className="w-96 h-96"
                src="/waving.gif"
              />
            </div>
          </motion.div>

          {/* Right Column: Auth Form */}
          <motion.div
            className="flex flex-col justify-center order-1 lg:order-2"
            variants={rightColumnVariants}
          >
            <div className="w-full">
              {isLogin ? (
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToSignup={() => setIsLogin(false)}
                />
              ) : (
                <SignupForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setIsLogin(true)}
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageShell>
  );
}
