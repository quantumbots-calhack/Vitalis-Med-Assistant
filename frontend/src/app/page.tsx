'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PageShell from '@/components/PageShell';
import CharacterGif from '@/components/CharacterGif';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
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

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

const characterVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
      delay: 0.3,
    },
  },
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.hasCompletedOnboarding) {
        router.push('/chatbot');
      } else {
        router.push('/onboarding/basic');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <PageShell className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen flex flex-col"
      >
        {/* Header with Logo */}
        <motion.header
          variants={logoVariants}
          className="flex justify-start p-6 lg:p-8"
        >
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.svg"
              alt="Medical Help Bot Logo"
              width={48}
              height={48}
              className="h-12 w-12"
              priority
            />
            <span className="text-xl font-semibold text-foreground">
              Medical Help Bot
            </span>
          </Link>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Content Column */}
              <div className="text-center lg:text-left space-y-8">
                <motion.div variants={itemVariants} className="space-y-6">
                  <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                    Welcome to{' '}
                    <span className="text-primary">Medical Help Bot</span>
                  </h1>
                  <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    Your AI-powered medical assistant for seamless patient
                    onboarding and healthcare guidance. Get started in minutes
                    with our intuitive platform.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    asChild
                    size="lg"
                    className="text-lg px-8 py-6 h-auto font-semibold"
                    aria-label="Get started with Medical Help Bot"
                  >
                    <Link href="/auth">Get Started</Link>
                  </Button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Secure & Private</span>
                  </div>
                </motion.div>
              </div>

              {/* Character Column */}
              <motion.div
                variants={characterVariants}
                className="flex flex-col items-center lg:items-end space-y-4"
              >
                <div className="relative">
                  <CharacterGif
                    pose="welcome"
                    size={500}
                    ariaLabel="Assistant welcoming you"
                    className="w-96 h-96 lg:w-[28rem] lg:h-[28rem]"
                    src="/waving.gif"
                  />
                  {/* Decorative background circle */}
                  <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="p-6 lg:p-8 text-center text-sm text-muted-foreground"
        >
          <p>Built with ❤️ for better healthcare experiences</p>
        </motion.footer>
      </motion.div>
    </PageShell>
  );
}
