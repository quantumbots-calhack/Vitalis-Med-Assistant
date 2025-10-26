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
    // Don't auto-redirect authenticated users
    // They should be able to see the welcome page
    // and click "Get Started" to go to auth/chat
  }, []);

  return (
    <PageShell className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen flex flex-col"
      >
        {/* Header with Logo */}
        <motion.header
          variants={logoVariants}
          className="flex justify-between items-center p-8 lg:p-10 border-b border-border/40"
        >
          <Link href="/" className="flex items-center">
            <Image
              src="/vitalis_logo.png"
              alt="Vitalis Logo"
              width={64}
              height={64}
              className="h-16 w-16"
              priority
            />
          </Link>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-8 lg:px-16 py-12 lg:py-20">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Content Column */}
              <div className="text-center lg:text-left space-y-8">
                <motion.div variants={itemVariants} className="space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                      Welcome to{' '}
                      <span className="text-primary">Vitalis</span>
                    </h1>
                    <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                      Your AI-powered medical assistant for seamless patient
                      onboarding and healthcare guidance. Get started in minutes
                      with our intuitive platform.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                  <Button
                    asChild
                    size="lg"
                    className="text-lg px-10 py-7 h-auto font-semibold btn-hover-glow shadow-lg shadow-primary/10"
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

              {/* Character Column with Revolving Feature Icons */}
              <motion.div
                variants={characterVariants}
                className="flex flex-col items-center lg:items-end space-y-4"
              >
                <div className="relative w-96 h-96 lg:w-[28rem] lg:h-[28rem]">
                  {/* Character in center */}
                  <CharacterGif
                    pose="welcome"
                    size={500}
                    ariaLabel="Assistant welcoming you"
                    className="w-96 h-96 lg:w-[28rem] lg:h-[28rem] relative z-10"
                    src="/waving.gif"
                  />
                  
                  {/* Revolving feature icons */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 40,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {/* RAG Icon */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <motion.div
                        className="flex flex-col items-center gap-2"
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 40,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20 backdrop-blur-sm">
                          RAG
                        </span>
                      </motion.div>
                    </div>
                    
                    {/* Agentic AI Icon */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                      <motion.div
                        className="flex flex-col items-center gap-2"
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 40,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20 backdrop-blur-sm">
                          Agentic AI
                        </span>
                      </motion.div>
                    </div>
                    
                    {/* ChromaDB Icon */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                      <motion.div
                        className="flex flex-col items-center gap-2"
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 40,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20 backdrop-blur-sm whitespace-nowrap">
                          ChromaDB
                        </span>
                      </motion.div>
                    </div>
                    
                    {/* Gemini AI Icon */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                      <motion.div
                        className="flex flex-col items-center gap-2"
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 40,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20 backdrop-blur-sm whitespace-nowrap">
                          Gemini AI
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                  
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
