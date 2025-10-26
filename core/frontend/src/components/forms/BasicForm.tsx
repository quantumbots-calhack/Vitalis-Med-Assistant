'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/lib/store';
import { basicSchema, type BasicData } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface BasicFormProps {
  className?: string;
}

const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;

export default function BasicForm({ className = '' }: BasicFormProps) {
  const router = useRouter();
  const { setBasic, getBasicData } = useOnboardingStore();

  // Initialize form with existing data if available
  const existingData = getBasicData();

  const form = useForm<BasicData>({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      fullName: existingData.fullName || '',
      age: existingData.age || undefined,
      sex: existingData.sex || undefined,
      heightCm: existingData.heightCm || undefined,
      weightKg: existingData.weightKg || undefined,
    },
  });

  const onSubmit = (data: BasicData) => {
    try {
      // Store validated data in Zustand
      setBasic(data);

      // Navigate to medical form
      router.push('/onboarding/medical');
    } catch (error) {
      console.error('Error storing basic data:', error);
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
              Basic Information
            </h2>
            <p className="text-muted-foreground mb-6">
              Let&apos;s start with your basic details to personalize your
              experience.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="fullName">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g., John Smith"
                      aria-describedby={
                        fieldState.error ? 'fullName-error' : undefined
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage id="fullName-error" role="alert">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="age"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="age">Age</FormLabel>
                  <FormControl>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      placeholder="e.g., 25"
                      aria-describedby={
                        fieldState.error ? 'age-error' : undefined
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                      value={field.value || ''}
                      onChange={e => {
                        const value = e.target.value;
                        field.onChange(
                          value === '' ? undefined : parseInt(value, 10)
                        );
                      }}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage id="age-error" role="alert">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="sex"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="sex">Sex</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        id="sex"
                        aria-describedby={
                          fieldState.error ? 'sex-error' : undefined
                        }
                        aria-invalid={fieldState.error ? 'true' : 'false'}
                      >
                        <SelectValue placeholder="Select your sex" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sexOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FormMessage id="sex-error" role="alert">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="heightCm"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="heightCm">Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      id="heightCm"
                      type="number"
                      min="1"
                      max="250"
                      placeholder="e.g., 175"
                      aria-describedby={
                        fieldState.error ? 'heightCm-error' : undefined
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                      value={field.value || ''}
                      onChange={e => {
                        const value = e.target.value;
                        field.onChange(
                          value === '' ? undefined : parseInt(value, 10)
                        );
                      }}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage id="heightCm-error" role="alert">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="weightKg"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="weightKg">Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      id="weightKg"
                      type="number"
                      min="1"
                      max="400"
                      step="0.1"
                      placeholder="e.g., 70.5"
                      aria-describedby={
                        fieldState.error ? 'weightKg-error' : undefined
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                      value={field.value || ''}
                      onChange={e => {
                        const value = e.target.value;
                        field.onChange(
                          value === '' ? undefined : parseFloat(value)
                        );
                      }}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage id="weightKg-error" role="alert">
                      {fieldState.error.message}
                    </FormMessage>
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
                ? 'Saving...'
                : 'Continue to Medical Info'}
            </Button>
            <p
              id="submit-help"
              className="text-sm text-muted-foreground mt-2 text-center"
            >
              Your information is secure and will only be used for your medical
              profile.
            </p>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
