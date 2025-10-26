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

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  className?: string;
}

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
  className = '',
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const success = await login(data.email, data.password);

      if (success) {
        toast.success('Welcome back!');
        onSuccess?.();
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
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
              Welcome Back
            </h2>
            <p className="text-muted-foreground mb-6">
              Sign in to your Medical Help Bot account
            </p>
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
                      placeholder="Enter your password"
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

          <motion.div variants={itemVariants} className="pt-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
              aria-describedby="submit-help"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <p
              id="submit-help"
              className="text-sm text-muted-foreground mt-2 text-center"
            >
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-primary hover:underline focus:outline-none focus:underline"
              >
                Sign up
              </button>
            </p>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
