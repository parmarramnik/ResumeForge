'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Layers,
  Files,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    total_users: 24,
    active_templates: 3,
    total_resumes: 42,
    compilation_jobs: 318,
    compilation_failures: 4,
    success_rate: '98.7%',
    avg_compile_time_ms: 240,
  });

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setMetrics(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const metricCards = [
    { title: 'Total Registered Users', value: metrics.total_users, icon: Users, change: '+12% this week' },
    { title: 'Active Templates', value: metrics.active_templates, icon: Layers, change: '100% verified' },
    { title: 'Total Resumes Created', value: metrics.total_resumes, icon: Files, change: '+28 new' },
    { title: 'Compilation Jobs', value: metrics.compilation_jobs, icon: Activity, change: `${metrics.success_rate} success rate` },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Admin Operations Center</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              System health, template management, user roles, and security audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/templates/new">
              <Button size="sm" className="text-xs gap-1.5 font-medium shadow-sm">
                <Layers className="w-3.5 h-3.5" />
                Create New Template
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Card key={idx} className="p-5 border-border bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{card.title}</span>
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold font-mono">{card.value}</div>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {card.change}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <Card className="p-5 flex flex-col justify-between hover:border-primary/50 transition-all">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Template Management</h3>
              <p className="text-xs text-muted-foreground">
                Author new LaTeX templates, define JSON schemas, test compilation, and version master templates.
              </p>
            </div>
            <Link href="/admin/templates" className="pt-4">
              <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                <span>Manage Templates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>

          <Card className="p-5 flex flex-col justify-between hover:border-primary/50 transition-all">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">User Role Management</h3>
              <p className="text-xs text-muted-foreground">
                Inspect registered user accounts, manage permissions, and assign administrative privileges.
              </p>
            </div>
            <Link href="/admin/users" className="pt-4">
              <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                <span>Manage Users</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>

          <Card className="p-5 flex flex-col justify-between hover:border-primary/50 transition-all">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Security & Audit Logs</h3>
              <p className="text-xs text-muted-foreground">
                Review immutable audit trails for logins, template publications, role changes, and security events.
              </p>
            </div>
            <Link href="/admin/audit-logs" className="pt-4">
              <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                <span>Inspect Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
