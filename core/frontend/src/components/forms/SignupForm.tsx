'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

export default function SignupForm({
  onSuccess,
  onSwitchToLogin,
  className = '',
}: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();

  const form = useForm<SignupFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(data.email, data.password, data.name);

      if (success) {
        toast.success('Account created successfully!');
        onSuccess?.();
      } else {
        toast.error('Email already exists');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
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
              Create Account
            </h2>
            <p className="text-muted-foreground mb-6">
              Join Medical Help Bot to get started with personalized healthcare
              assistance
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., John Smith"
                      aria-describedby={
                        fieldState.error ? 'name-error' : undefined
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage id="name-error" role="alert">
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
              name="email"
              rules={{
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., john@example.com"
                      aria-describedby={
                        fieldState.error ? 'email-error' : undefined
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage id="email-error" role="alert">
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
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      aria-describedby={
                        fieldState.error ? 'password-error' : undefined
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage id="password-error" role="alert">
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
              name="confirmPassword"
              rules={{ required: 'Please confirm your password' }}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      aria-describedby={
                        fieldState.error ? 'confirmPassword-error' : undefined
                      }
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage id="confirmPassword-error" role="alert">
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
              disabled={isLoading}
              aria-describedby="submit-help"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <p
              id="submit-help"
              className="text-sm text-muted-foreground mt-2 text-center"
            >
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline focus:outline-none focus:underline"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
