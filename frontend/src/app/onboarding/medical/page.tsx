'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageShell from '@/components/PageShell';
import CharacterGif from '@/components/CharacterGif';
import MedicalForm from '@/components/forms/MedicalForm';
import SpeechBubble from '@/components/SpeechBubble';
import MockModeBanner from '@/components/MockModeBanner';
import {
  poseOnValidationSuccess,
  poseOnValidationError,
  type Pose,
} from '@/lib/mascot';

export default function MedicalPage() {
  const [characterPose, setCharacterPose] = useState<Pose>('prompt');

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
    <>
      <MockModeBanner />
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
                  Please provide your medical details to help us better assist
                  you.
                </SpeechBubble>

                <CharacterGif
                  pose={characterPose}
                  size={500}
                  ariaLabel="Assistant helping with medical information"
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
              <div className="w-full">
                <MedicalForm />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </PageShell>
    </>
  );
}
