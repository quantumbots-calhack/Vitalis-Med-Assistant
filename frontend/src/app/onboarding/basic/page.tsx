'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageShell from '@/components/PageShell';
import CharacterGif from '@/components/CharacterGif';
import BasicForm from '@/components/forms/BasicForm';
import SpeechBubble from '@/components/SpeechBubble';

export default function BasicOnboarding() {
  const [characterPose, setCharacterPose] = useState<'prompt' | 'pointLeft'>(
    'prompt'
  );
  const [hasFocusedName, setHasFocusedName] = useState(false);

  // Handle first focus on name field
  useEffect(() => {
    const handleFirstFocus = () => {
      if (!hasFocusedName) {
        setHasFocusedName(true);
        setCharacterPose('pointLeft');

        // Return to prompt after 1.5 seconds
        setTimeout(() => {
          setCharacterPose('prompt');
        }, 1500);
      }
    };

    const nameField = document.getElementById('fullName');
    if (nameField) {
      nameField.addEventListener('focus', handleFirstFocus, { once: true });

      return () => {
        nameField.removeEventListener('focus', handleFirstFocus);
      };
    }
  }, [hasFocusedName]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        staggerChildren: 0.2,
      },
    },
  };

  const leftColumnVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  const rightColumnVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        delay: 0.2,
      },
    },
  };

  return (
    <PageShell className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <motion.div
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start min-h-screen">
          {/* Left Column: Character with Speech Bubble */}
          <motion.div
            className="flex flex-col items-center lg:items-start space-y-6 order-2 lg:order-1"
            variants={leftColumnVariants}
          >
            <div className="flex flex-col items-center lg:items-start space-y-1">
              <SpeechBubble className="max-w-sm">
                Let&apos;s start with your basic details. This helps us
                personalize your medical experience.
              </SpeechBubble>

              <CharacterGif
                pose={characterPose}
                size={500}
                ariaLabel="Assistant helping with basic information"
                className="w-96 h-96"
                src="/onboarding.gif"
              />
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            className="flex flex-col justify-center order-1 lg:order-2"
            variants={rightColumnVariants}
          >
            <BasicForm className="w-full" />
          </motion.div>
        </div>
      </motion.div>
    </PageShell>
  );
}
