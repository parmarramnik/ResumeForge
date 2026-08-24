'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileCode2, Lock, Mail, User, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { registerSchema } from '@resumeforge/validation';
import { createClient } from '@/lib/supabase/client';

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', password: '', confirm_password: '' },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            role: 'USER',
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setErrorMessage('An account with this email already exists. Please sign in instead.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      // If session exists immediately -> Go directly to dashboard
      if (data?.session) {
        router.push('/dashboard');
        router.refresh();
        return;
      }

      // If email confirmation required -> Prompt user
      if (data?.user && !data.session) {
        setSuccessMessage('Account created! You can now sign in with your email and password.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to register account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
              <FileCode2 className="w-5 h-5" />
            </div>
            <span>ResumeForge</span>
          </Link>
          <p className="text-xs text-muted-foreground">Create your account to start building precision resumes</p>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold">Get started with ResumeForge</CardTitle>
            <CardDescription className="text-xs">
              Access the LaTeX Maker IDE and the structured Template Generator
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register('full_name')}
                    placeholder="Arjun Mehta"
                    className="pl-9 text-xs"
                    autoComplete="name"
                  />
                </div>
                {errors.full_name && (
                  <p className="text-[11px] text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Email address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9 text-xs"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Confirm Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register('confirm_password')}
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirm_password && (
                  <p className="text-[11px] text-destructive">{errors.confirm_password.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full text-xs font-semibold h-9 mt-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex justify-center border-t border-border/50 pt-4 text-xs text-muted-foreground">
            <span>Already have an account?</span>
            <Link href="/login" className="ml-1 font-semibold text-foreground hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
