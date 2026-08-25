'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Code,
  FileEdit,
  Files,
  ArrowRight,
  Clock,
  ChevronRight,
  Sparkles,
  Plus,
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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Your Resume Workspace</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Select one of the two services below to create or update your single-page resume.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/maker">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium border-border h-8">
                <Code className="w-3.5 h-3.5" />
                <span>Resume Maker</span>
              </Button>
            </Link>
            <Link href="/generator">
              <Button size="sm" className="gap-1.5 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 h-8">
                <Plus className="w-3.5 h-3.5" />
                <span>Resume Generator</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Dual Core Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service 1: Resume Maker */}
          <Card className="border-border hover:border-foreground/30 transition-all shadow-sm rounded-xl bg-card flex flex-col justify-between">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm">
                  <Code className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="font-mono text-[10px] uppercase border-border">
                  Service 1
                </Badge>
              </div>
              <CardTitle className="text-base font-bold mt-4">Resume Maker (Code Editor)</CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1.5">
                Full-featured LaTeX workspace. Write or customize your resume code directly with live side-by-side PDF preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <Link href="/maker">
                <Button className="w-full justify-between text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 h-9" size="sm">
                  <span>Open Resume Maker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Service 2: Resume Generator */}
          <Card className="border-border hover:border-foreground/30 transition-all shadow-sm rounded-xl bg-card flex flex-col justify-between">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm">
                  <FileEdit className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="font-mono text-[10px] uppercase border-border">
                  Service 2
                </Badge>
              </div>
              <CardTitle className="text-base font-bold mt-4">Resume Generator (Form Wizard)</CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1.5">
                Easy guided form. Fill in your experience, skills, and education to automatically generate a polished single-page PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <Link href="/generator">
                <Button variant="outline" className="w-full justify-between text-xs font-semibold border-border h-9" size="sm">
                  <span>Open Resume Generator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Resumes List */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Your Saved Resumes</h2>
              <p className="text-xs text-muted-foreground">Continue editing where you left off</p>
            </div>
            <Link href="/resumes">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground h-8">
                <span>View all resumes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {resumes.length === 0 && !loading ? (
            <Card className="p-8 text-center space-y-3 bg-card border-dashed border-border shadow-none rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Files className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold">No resumes created yet</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm mx-auto">
                  Pick either the Resume Maker or Resume Generator above to start building your first resume.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Link href="/maker">
                  <Button size="sm" variant="outline" className="text-xs border-border h-8">Create with Maker</Button>
                </Link>
                <Link href="/generator">
                  <Button size="sm" className="text-xs bg-foreground text-background hover:bg-foreground/90 h-8">Create with Generator</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resumes.slice(0, 3).map((resume) => (
                <Card key={resume.id} className="p-4 hover:border-foreground/30 transition-all flex flex-col justify-between bg-card border-border shadow-sm rounded-xl">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono border-border">
                        {resume.service_type === 'maker' ? 'Code Editor' : 'Form Wizard'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(resume.updated_at)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-xs truncate mt-1">{resume.title}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {resume.template?.title || (resume.service_type === 'maker' ? 'Custom LaTeX Document' : 'Standard 1-Page Template')}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-2 border-t border-border mt-4">
                    <Link href={`/${resume.service_type}/${resume.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs border-border h-8 font-medium">
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
