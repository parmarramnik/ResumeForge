'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Cpu, Database, Server } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compiler runtime parameters, database connection, and sandbox limits.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">LaTeX Compiler Sandbox</CardTitle>
              </div>
              <Badge variant="success" className="text-xs font-mono">Isolated</Badge>
            </div>
            <CardDescription className="text-xs">
              Configured execution limits for isolated compilation service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Compiler Engine</span>
              <span className="font-mono font-medium">Tectonic Standalone / TeX Live</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Compilation Timeout</span>
              <span className="font-mono font-medium">8,000 ms</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Shell Escape Execution</span>
              <span className="font-mono font-medium text-emerald-600">Disabled (--no-shell-escape)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Maximum Document Payload</span>
              <span className="font-mono font-medium">2.0 MB</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
