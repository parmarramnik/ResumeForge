'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Template } from '@resumeforge/shared-types';
import { INITIAL_TEMPLATES } from '@/lib/supabase/mock-data';
import { formatDate } from '@/lib/utils';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTemplates = () => {
    fetch('/api/admin/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTemplates(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleToggleActive = async (template: Template) => {
    try {
      const res = await fetch(`/api/admin/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !template.is_active }),
      });
      if (res.ok) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === template.id ? { ...t, is_active: !t.is_active } : t))
        );
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {}
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Template Catalog Management</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Author, test, publish, and version LaTeX resume templates for Generator users.
            </p>
          </div>

          <Link href="/admin/templates/new">
            <Button size="sm" className="gap-1.5 text-xs font-medium shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              New Template
            </Button>
          </Link>
        </div>

        {/* Templates Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tmpl) => (
            <Card key={tmpl.id} className="p-5 flex flex-col justify-between border-border bg-card">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {tmpl.category || 'General'}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      v{tmpl.version || 1}
                    </Badge>
                  </div>

                  <button
                    onClick={() => handleToggleActive(tmpl)}
                    className="flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                    title="Toggle active status"
                  >
                    {tmpl.is_active ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="font-semibold text-sm">{tmpl.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-border/50 mt-4 flex items-center justify-between gap-2">
                <Link href={`/admin/templates/${tmpl.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit & Test
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(tmpl.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
