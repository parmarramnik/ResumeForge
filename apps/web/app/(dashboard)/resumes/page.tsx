'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Files,
  Code,
  Sparkles,
  Search,
  MoreVertical,
  Download,
  FileCode,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  Plus,
  Clock,
  Check,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate, formatTimeAgo } from '@/lib/utils';
import { Resume } from '@resumeforge/shared-types';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'maker' | 'generator'>('all');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>('');

  const fetchResumes = () => {
    fetch('/api/resumes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setResumes(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        fetchResumes();
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {}
  };

  const handleSaveRename = async (id: string) => {
    if (!renameTitle.trim()) return;
    try {
      await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: renameTitle }),
      });
      setResumes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, title: renameTitle } : r))
      );
      setRenamingId(null);
    } catch {}
  };

  const handleDownloadTex = (resume: Resume) => {
    const blob = new Blob([resume.raw_tex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.title.replace(/\s+/g, '_')}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredResumes = resumes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || r.service_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Resumes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your LaTeX documents, generator instances, versions, and exports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/maker">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Code className="w-3.5 h-3.5" />
                New in Maker
              </Button>
            </Link>
            <Link href="/generator">
              <Button size="sm" className="gap-1.5 text-xs font-medium shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                New in Generator
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes by title..."
              className="pl-9 h-8 text-xs bg-muted/30"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            <Button
              variant={filterType === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="h-8 text-xs px-3"
            >
              All ({resumes.length})
            </Button>
            <Button
              variant={filterType === 'maker' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('maker')}
              className="h-8 text-xs px-3 gap-1"
            >
              <Code className="w-3 h-3" />
              Maker
            </Button>
            <Button
              variant={filterType === 'generator' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('generator')}
              className="h-8 text-xs px-3 gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Generator
            </Button>
          </div>
        </div>

        {/* Resumes Grid */}
        {filteredResumes.length === 0 && !loading ? (
          <Card className="p-12 text-center space-y-3 bg-card border-dashed">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Files className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">No resumes found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery
                  ? 'No resumes match your active search filter.'
                  : 'Get started by creating your first resume with Maker or Generator.'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResumes.map((resume) => (
              <Card
                key={resume.id}
                className="p-5 flex flex-col justify-between border-border hover:border-primary/40 transition-all bg-card shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={resume.service_type === 'maker' ? 'default' : 'secondary'}
                      className="text-[10px] font-mono uppercase"
                    >
                      {resume.service_type === 'maker' ? 'LaTeX IDE' : 'Generator'}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(resume.updated_at)}
                    </span>
                  </div>

                  {/* Title or Inline Rename Input */}
                  {renamingId === resume.id ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Input
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        className="h-7 text-xs font-semibold"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleSaveRename(resume.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-sm truncate">{resume.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {resume.template?.title || (resume.service_type === 'maker' ? 'Custom LaTeX Document' : 'Standard ATS Template')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions Toolbar */}
                <div className="pt-4 border-t border-border/50 mt-4 flex items-center justify-between gap-1">
                  <Link href={`/${resume.service_type}/${resume.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full text-xs font-medium h-8">
                      Open Resume
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setRenamingId(resume.id);
                      setRenameTitle(resume.title);
                    }}
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDuplicate(resume.id)}
                    title="Duplicate Resume"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownloadTex(resume)}
                    title="Export .tex"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(resume.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
