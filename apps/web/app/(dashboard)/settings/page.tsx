'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme/theme-provider';
import {
  Cpu,
  Sun,
  Moon,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertCircle,
  Database,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Password state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Cache state
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Failed to update password.');
      } else {
        setPasswordSuccess('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 3000);
      }
    } catch {
      setPasswordError('Network error while updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resumeforge_maker_tex');
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2500);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace & Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure appearance, account security, LaTeX compiler parameters, and data caching.
          </p>
        </div>

        {/* 1. Theme & Appearance */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-foreground" />
                <CardTitle className="text-sm font-semibold">Appearance & Theme</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">Theme Options</Badge>
            </div>
            <CardDescription className="text-xs">
              Select your preferred visual style for the entire workspace and editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all relative',
                  theme === 'light'
                    ? 'border-foreground bg-accent/40 shadow-sm'
                    : 'border-border hover:border-muted-foreground/40 bg-card'
                )}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-white border border-border flex items-center justify-center text-foreground shadow-sm">
                      <Sun className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Light & Bright</h4>
                      <p className="text-[10px] text-muted-foreground">Crisp high-contrast white mode</p>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Mini Light Preview Swatch */}
                <div className="w-full h-12 rounded border border-border bg-white p-2 flex items-center gap-2">
                  <div className="w-8 h-full bg-zinc-100 rounded border border-zinc-200" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-3/4 bg-zinc-900 rounded" />
                    <div className="h-1.5 w-1/2 bg-zinc-300 rounded" />
                  </div>
                </div>
              </button>

              {/* Dark Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all relative',
                  theme === 'dark'
                    ? 'border-foreground bg-accent/40 shadow-sm'
                    : 'border-border hover:border-muted-foreground/40 bg-card'
                )}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-zinc-950 border border-zinc-800 flex items-center justify-center text-foreground shadow-sm">
                      <Moon className="w-4 h-4 text-zinc-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Dark & Deep</h4>
                      <p className="text-[10px] text-muted-foreground">Minimalist onyx theme</p>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Mini Dark Preview Swatch */}
                <div className="w-full h-12 rounded border border-zinc-800 bg-zinc-950 p-2 flex items-center gap-2">
                  <div className="w-8 h-full bg-zinc-900 rounded border border-zinc-800" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-3/4 bg-zinc-100 rounded" />
                    <div className="h-1.5 w-1/2 bg-zinc-600 rounded" />
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 2. Security & Change Password */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-foreground" />
                <CardTitle className="text-sm font-semibold">Change Password</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">Security</Badge>
            </div>
            <CardDescription className="text-xs">
              Update your account password with instant verification.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword}>
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Current Password</Label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-[11px] text-muted-foreground">Passwords must be at least 6 characters.</span>
              <Button
                type="submit"
                size="sm"
                disabled={passwordLoading || !newPassword}
                className="text-xs gap-1.5 h-8 font-semibold bg-foreground text-background hover:bg-foreground/90"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* 3. Compiler Runtime & Sandbox Parameters */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-foreground" />
                <CardTitle className="text-sm font-semibold">LaTeX Compiler Architecture</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-border">
                ISOLATED SANDBOX
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Configured execution limits for isolated sub-second pdflatex compilation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Compilation Engine</span>
              <span className="font-mono font-medium text-foreground">pdflatex (Overleaf compatible) / Tectonic</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">SHA-256 PDF Cache</span>
              <span className="font-mono font-medium text-foreground">Enabled (0ms instant hits)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Execution Timeout</span>
              <span className="font-mono font-medium text-foreground">12,000 ms</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Security Sandbox</span>
              <span className="font-mono font-medium text-foreground">Enforced (--no-shell-escape)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Max Document Size</span>
              <span className="font-mono font-medium text-foreground">2.0 MB</span>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-[11px] text-muted-foreground">Clear cached local draft state and editor buffers.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="text-xs gap-1.5 h-8 font-medium border-border"
            >
              {cacheCleared ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Cache Cleared!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Editor Cache</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
