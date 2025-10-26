'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useOnboardingStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import {
  medicalSchema,
  combinedSchema,
  type MedicalData,
} from '@/lib/validation';
import { saveProfile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface MedicalFormProps {
  className?: string;
}

export default function MedicalForm({ className = '' }: MedicalFormProps) {
  const router = useRouter();
  const { getBasicData, getMedicalData, reset } = useOnboardingStore();
  const { markOnboardingComplete, user } = useAuthStore();

  // Initialize form with existing data if available
  const existingData = getMedicalData();

  const form = useForm<MedicalData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(medicalSchema) as any,
    defaultValues: {
      allergies: existingData.allergies || '',
      medications: existingData.medications || '',
      history: existingData.history || '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: MedicalData) => {
    try {
      // Get basic data from store
      const basicData = getBasicData();

      // Validate that we have basic data
      if (!basicData.fullName || !basicData.age || !basicData.sex) {
        toast.error('Please complete the basic information first');
        router.push('/onboarding/basic');
        return;
      }

      // Combine basic and medical data
      const combinedData = {
        ...basicData,
        ...data,
      };

      // Validate combined data
      const validatedData = combinedSchema.parse(combinedData);

      // Save profile
      const result = await saveProfile(validatedData);

      // Store profile in ChromaDB for RAG
      try {
        const patientId = user?.id ? `patient_${user.id}` : `patient_${result.id}`;
        await fetch('http://localhost:5001/api/store-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patient_id: patientId,
            fullName: validatedData.fullName,
            email: user?.email || '',
            age: validatedData.age,
            sex: validatedData.sex,
            height_cm: validatedData.heightCm,
            weight_kg: validatedData.weightKg,
            allergies: validatedData.allergies,
            medications: validatedData.medications,
            medical_history: validatedData.history
          })
        });
      } catch (error) {
        console.error('Failed to store profile in ChromaDB:', error);
        // Don't block the onboarding flow if ChromaDB storage fails
      }

      // Show success message
      toast.success('Profile saved successfully!', {
        description: `Your profile has been created with ID: ${result.id}`,
      });

      // Mark onboarding as complete and navigate to ready page
      markOnboardingComplete();
      reset();
      router.push('/ready');
    } catch (error) {
      console.error('Error saving profile:', error);

      // Show error message
      toast.error('Failed to save profile', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <motion.div
      className={`w-full max-w-md mx-auto ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Medical Information
            </h2>
            <p className="text-muted-foreground mb-6">
              Please provide your medical details to help us better assist you.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="allergies"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="allergies">Allergies</FormLabel>
                  <FormControl>
                    <Textarea
                      id="allergies"
                      placeholder="List any allergies you have (e.g., penicillin, shellfish, pollen)"
                      className="min-h-[80px] resize-none"
                      aria-describedby={
                        fieldState.error ? 'allergies-error' : 'allergies-help'
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error ? (
                    <FormMessage id="allergies-error" role="alert">
                      {fieldState.error.message}
                    </FormMessage>
                  ) : (
                    <p
                      id="allergies-help"
                      className="text-sm text-muted-foreground"
                    >
                      Leave blank if you have no known allergies
                    </p>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="medications"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="medications">
                    Current Medications
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="medications"
                      placeholder="List any medications you are currently taking (include dosage if known)"
                      className="min-h-[80px] resize-none"
                      aria-describedby={
                        fieldState.error
                          ? 'medications-error'
                          : 'medications-help'
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error ? (
                    <FormMessage id="medications-error" role="alert">
                      {fieldState.error.message}
                    </FormMessage>
                  ) : (
                    <p
                      id="medications-help"
                      className="text-sm text-muted-foreground"
                    >
                      Include prescription and over-the-counter medications
                    </p>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="history"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="history">Medical History</FormLabel>
                  <FormControl>
                    <Textarea
                      id="history"
                      placeholder="Describe any relevant medical conditions, surgeries, or health concerns"
                      className="min-h-[100px] resize-none"
                      aria-describedby={
                        fieldState.error ? 'history-error' : 'history-help'
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error ? (
                    <FormMessage id="history-error" role="alert">
                      {fieldState.error.message}
                    </FormMessage>
                  ) : (
                    <p
                      id="history-help"
                      className="text-sm text-muted-foreground"
                    >
                      Include chronic conditions, past surgeries, or ongoing
                      health issues
                    </p>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={form.formState.isSubmitting}
              aria-describedby="submit-help"
            >
              {form.formState.isSubmitting
                ? 'Saving Profile...'
                : 'Save Profile'}
            </Button>
            <p
              id="submit-help"
              className="text-sm text-muted-foreground mt-2 text-center"
            >
              Your medical information is confidential and will be used only for
              your care.
            </p>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
