'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Cpu,
  Check,
  RotateCcw,
  Server,
  ShieldCheck,
  Zap,
  Sliders,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [autoCompileDelay, setAutoCompileDelay] = useState<string>('manual');
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDelay = localStorage.getItem('resumeforge_compile_delay') || 'manual';
      setAutoCompileDelay(savedDelay);
    }
  }, []);

  const handleSaveDelay = (delay: string) => {
    setAutoCompileDelay(delay);
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeforge_compile_delay', delay);
    }
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
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
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure compiler execution behavior, review sandbox architecture, and manage local memory caching.
          </p>
        </div>

        {/* 1. Compilation & Trigger Preferences */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-foreground" />
                <CardTitle className="text-sm font-semibold">Compilation Behavior</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">Preferences</Badge>
            </div>
            <CardDescription className="text-xs">
              Configure how resume PDF rendering is triggered from your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Compilation Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-border">
              <div>
                <span className="font-medium text-foreground">Trigger Mode</span>
                <p className="text-[11px] text-muted-foreground">Select between manual keyboard compilation and automatic debounce</p>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'manual', label: 'Manual (Ctrl+S / Button)' },
                  { id: 'auto', label: 'Auto (Debounced)' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleSaveDelay(mode.id)}
                    className={cn(
                      'px-3 py-1 rounded text-xs font-medium border transition-colors',
                      autoCompileDelay === mode.id
                        ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                        : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Keyboard className="w-3.5 h-3.5 text-foreground" />
                <span>Compile Shortcut</span>
              </div>
              <kbd className="px-2 py-0.5 rounded bg-muted border border-border text-[11px] font-mono text-foreground font-semibold">
                Ctrl + S / Cmd + S
              </kbd>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-[11px] text-muted-foreground">
              {settingsSaved ? 'Preferences updated.' : 'Saved automatically.'}
            </span>
            {settingsSaved && (
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            )}
          </CardFooter>
        </Card>

        {/* 2. Compiler Architecture & Sandbox Parameters */}
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
              Runtime environment parameters for isolated sub-second pdflatex & tectonic compilation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Server className="w-3.5 h-3.5 text-foreground" />
                <span>Active Engines</span>
              </div>
              <span className="font-mono font-medium text-foreground">pdflatex (Overleaf compatible) / Tectonic</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-foreground" />
                <span>SHA-256 Memory PDF Cache</span>
              </div>
              <span className="font-mono font-medium text-foreground">Active (0ms instant cache hits)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Execution Timeout</span>
              <span className="font-mono font-medium text-foreground">15,000 ms</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
                <span>Security Sandbox</span>
              </div>
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
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
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
