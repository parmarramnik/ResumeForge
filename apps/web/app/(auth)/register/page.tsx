'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileCode2, Lock, Mail, User, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
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
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', password: '', confirm_password: '' },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const handleGuestAccess = () => {
    document.cookie = 'resumeforge_guest=true; path=/; max-age=86400';
    router.push('/dashboard');
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRateLimited(false);

    try {
      // 1. Register user via server-side Admin API (bypasses public client SMTP rate limits)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.error?.toLowerCase().includes('rate limit')) {
          setIsRateLimited(true);
          setErrorMessage('Registration rate limit reached. Please sign in or use Demo / Guest mode.');
        } else {
          setErrorMessage(data.error || 'Failed to create account.');
        }
        return;
      }

      // 2. Automatically log the user in immediately
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        setSuccessMessage('Account created successfully! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }

      setSuccessMessage('Account created! Entering workspace...');
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'Failed to register account. Please try again.');
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
          <p className="text-xs text-muted-foreground">Create your account to start building precision resumes</p>
        </div>

        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold">Get started with ResumeForge</CardTitle>
            <CardDescription className="text-xs">
              Access the Code Editor IDE and the structured Form Wizard
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                  {isRateLimited && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGuestAccess}
                      className="w-full h-7 text-xs font-semibold gap-1 bg-background text-foreground hover:bg-muted"
                    >
                      <span>Continue with Demo / Guest Mode</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
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

              <Button type="submit" disabled={isLoading} className="w-full text-xs font-semibold h-9 mt-2 bg-foreground text-background hover:bg-foreground/90">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col gap-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
            <div className="flex justify-center">
              <span>Already have an account?</span>
              <Link href="/login" className="ml-1 font-semibold text-foreground hover:underline">
                Sign in
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
