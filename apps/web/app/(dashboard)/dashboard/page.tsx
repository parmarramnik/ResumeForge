'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Code,
  Sparkles,
  Files,
  ArrowRight,
  Clock,
  FileCheck,
  CheckCircle2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils';
import { Resume } from '@resumeforge/shared-types';

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/resumes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setResumes(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workspace Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create, compile, and manage ATS-friendly LaTeX resumes with precision typesetting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/maker">
              <Button variant="outline" size="sm" className="gap-2 font-medium">
                <Code className="w-4 h-4 text-primary" />
                Open Maker IDE
              </Button>
            </Link>
            <Link href="/generator">
              <Button size="sm" className="gap-2 font-medium shadow-sm">
                <Sparkles className="w-4 h-4" />
                Launch Generator
              </Button>
            </Link>
          </div>
        </div>

        {/* Dual Core Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service 1: Maker Card */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-sm group">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Code className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  Full Control
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold mt-4">Resume Maker</CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1">
                Directly write and edit LaTeX code inside an isolated Monaco IDE with instant compilation, error diagnostics, and PDF exports.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Link href="/maker">
                <Button className="w-full justify-between group-hover:bg-primary/90 text-xs font-semibold" size="sm">
                  <span>Open LaTeX Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Service 2: Generator Card */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-sm group">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <Badge variant="success" className="font-mono text-xs">
                  Structured Form
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold mt-4">Resume Generator</CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1">
                Select an admin-approved ATS template, enter your structured career data in a step-by-step wizard, and produce compiled PDFs automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Link href="/generator">
                <Button variant="outline" className="w-full justify-between text-xs font-semibold" size="sm">
                  <span>Start Step-by-Step Wizard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Resumes List */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recent Resumes</h2>
              <p className="text-xs text-muted-foreground">Your saved documents and drafts</p>
            </div>
            <Link href="/resumes">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {resumes.length === 0 && !loading ? (
            <Card className="p-8 text-center space-y-3 bg-card border-dashed">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Files className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium">No resumes created yet</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get started by opening the Resume Maker or using the Resume Generator wizard.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Link href="/maker">
                  <Button size="sm" variant="outline" className="text-xs">Create in Maker</Button>
                </Link>
                <Link href="/generator">
                  <Button size="sm" className="text-xs">Create in Generator</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resumes.slice(0, 3).map((resume) => (
                <Card key={resume.id} className="p-4 hover:border-primary/50 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={resume.service_type === 'maker' ? 'default' : 'secondary'} className="text-[10px] uppercase font-mono">
                        {resume.service_type}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(resume.updated_at)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm truncate">{resume.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {resume.template?.title || (resume.service_type === 'maker' ? 'Custom LaTeX IDE' : 'Standard Template')}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-2 border-t border-border/50 mt-4">
                    <Link href={`/${resume.service_type}/${resume.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Open Resume
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
