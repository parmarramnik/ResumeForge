'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Cpu,
  Check,
  RotateCcw,
  Server,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export default function SettingsPage() {
  // Cache state
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            LaTeX compiler runtime architecture, security sandbox configurations, and local memory cache.
          </p>
        </div>

        {/* Compiler Runtime & Sandbox Parameters */}
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
              Configured execution parameters for isolated, sub-second pdflatex & tectonic compilation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Server className="w-3.5 h-3.5" />
                <span>Compilation Engine</span>
              </div>
              <span className="font-mono font-medium text-foreground">pdflatex (Overleaf compatible) / Tectonic</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-3.5 h-3.5" />
                <span>SHA-256 Memory PDF Cache</span>
              </div>
              <span className="font-mono font-medium text-foreground">Enabled (0ms instant hits)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Execution Timeout</span>
              <span className="font-mono font-medium text-foreground">15,000 ms</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldAlert className="w-3.5 h-3.5" />
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
