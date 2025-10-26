'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import CharacterGif from '@/components/CharacterGif';
import SpeechBubble from '@/components/SpeechBubble';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';

export default function ReadyPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { markOnboardingComplete } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  // Orbit animation variants
  const orbitVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: 'linear' as const,
      },
    },
  };

  // Reduced motion orbit variants (subtle pulse instead of rotation)
  const reducedMotionOrbitVariants = {
    animate: {
      scale: [1, 1.02, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  // Button variants for orbit
  const orbitButtonVariants = {
    animate: {
      rotate: -360, // Counter-rotate to keep buttons upright
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: 'linear' as const,
      },
    },
  };

  const reducedMotionButtonVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const handleStartOver = () => {
    router.push('/onboarding/basic');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToChatbot = () => {
    markOnboardingComplete();
    router.push('/chatbot');
  };

  return (
    <PageShell className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
      <motion.div
        className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-center space-y-8 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          <div className="flex flex-col items-center space-y-2">
            <SpeechBubble className="max-w-md">
              All set—ready to go! 🚀 Click the chat icon to start talking with
              your Vitalis assistant.
            </SpeechBubble>

            {/* Character with side chat button */}
            <div className="relative w-96 h-96 flex items-center justify-center">
              {/* Character in the center */}
              <CharacterGif
                pose={shouldReduceMotion ? 'idle' : 'celebrate'}
                size={500}
                ariaLabel="Assistant celebrating profile completion"
                className="w-96 h-96 transition-transform duration-300 hover:scale-105"
                src="/sitting.gif"
              />

              {/* Static chat button on the side */}
              <motion.div
                className="absolute top-0 right-0 transform translate-x-8 -translate-y-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGoToChatbot}
                  className="w-20 h-20 rounded-full border-2 border-primary/30 bg-background/90 backdrop-blur-sm hover:bg-primary hover:border-primary shadow-lg btn-hover-glow"
                  aria-label="Start chatting with Vitalis"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M13 8H7" />
                    <path d="M17 12H7" />
                  </svg>
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to Vitalis!
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for completing your profile. We now have all the
              information needed to provide you with personalized care
              recommendations and assistance.
            </p>
          </div>

          {/* Static action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoHome}
              size="lg"
              className="w-full sm:w-auto"
            >
              Go to Home
            </Button>
            <Button
              onClick={handleStartOver}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Start Over
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Your information is secure and will only be used for your medical
              care.
            </p>
            <p>
              You can update your profile at any time by going through the
              onboarding process again.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
