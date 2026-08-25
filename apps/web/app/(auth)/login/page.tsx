'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileCode2, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { loginSchema } from '@resumeforge/validation';
import { createClient } from '@/lib/supabase/client';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const handleGuestAccess = () => {
    // Set a session-only cookie without persistence
    document.cookie = 'resumeforge_guest=true; path=/; SameSite=Lax';
    router.push('/dashboard');
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please verify your credentials or create an account.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Please confirm your email address before signing in.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.session) {
        // Clear any leftover guest cookies
        document.cookie = 'resumeforge_guest=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
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
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm">
              <FileCode2 className="w-5 h-5" />
            </div>
            <span>ResumeForge</span>
          </Link>
          <p className="text-xs text-muted-foreground">Sign in to your professional resume workspace</p>
        </div>

        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access Maker and Generator services
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

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
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full text-xs font-semibold h-9 mt-2 bg-foreground text-background hover:bg-foreground/90">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col gap-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
            <div className="flex justify-center">
              <span>Don&apos;t have an account?</span>
              <Link href="/register" className="ml-1 font-semibold text-foreground hover:underline">
                Create an account
              </Link>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGuestAccess}
              className="text-[11px] text-muted-foreground hover:text-foreground h-7"
            >
              Skip to Workspace (Guest Mode) →
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
