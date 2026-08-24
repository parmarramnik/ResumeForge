'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Layers,
  Play,
  Save,
  Check,
  AlertCircle,
  FileCode,
  Sliders,
  CheckCircle2,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ResumePdfViewer } from '@/components/pdf/resume-pdf-viewer';
import { Template } from '@resumeforge/shared-types';
import { SAMPLE_RESUME_FORM_DATA, INITIAL_TEMPLATES } from '@/lib/supabase/mock-data';
import { renderTemplate } from '@resumeforge/template-engine';

interface MonacoEditorComponentProps {
  value: string;
  onChange: (val: string) => void;
  onCompile?: () => void;
  errors?: any[];
  theme?: 'vs-dark' | 'light';
  readOnly?: boolean;
  highlightLine?: number | null;
}

const MonacoLatexEditor = dynamic<MonacoEditorComponentProps>(
  () => import('@/components/editor/monaco-latex-editor').then((mod) => mod.MonacoLatexEditor),
  { ssr: false, loading: () => <div className="h-full bg-[#1e1e1e] flex items-center justify-center text-xs text-muted-foreground font-mono">Loading Monaco Editor...</div> }
);

interface TemplateEditorViewProps {
  initialTemplate?: Template | null;
  isNew?: boolean;
}

export function TemplateEditorView({ initialTemplate, isNew = false }: TemplateEditorViewProps) {
  const router = useRouter();
  const [title, setTitle] = useState<string>(initialTemplate?.title || 'Executive Modern Template');
  const [description, setDescription] = useState<string>(
    initialTemplate?.description || 'Crisp, contemporary single-column layout optimized for modern tech and executive resumes.'
  );
  const [category, setCategory] = useState<string>(initialTemplate?.category || 'Professional');
  const [texTemplate, setTexTemplate] = useState<string>(
    initialTemplate?.tex_template || INITIAL_TEMPLATES[0].tex_template
  );
  const [sampleDataJson, setSampleDataJson] = useState<string>(
    JSON.stringify(SAMPLE_RESUME_FORM_DATA, null, 2)
  );

  const [activeTab, setActiveTab] = useState<'tex' | 'schema' | 'sample'>('tex');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [hasCompiledSuccessfully, setHasCompiledSuccessfully] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Test compilation runner
  const handleTestCompile = useCallback(async () => {
    setIsCompiling(true);
    setCompileError(null);

    let parsedSample = {};
    try {
      parsedSample = JSON.parse(sampleDataJson);
    } catch {
      setCompileError('Sample data is not valid JSON.');
      setIsCompiling(false);
      return;
    }

    try {
      // 1. Render template with sample JSON
      const renderedTex = renderTemplate(texTemplate, parsedSample as Record<string, unknown>);

      // 2. Compile via sandbox API
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tex: renderedTex, engine: 'tectonic' }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        setCompileError(errorJson.error || 'Test compilation failed');
        setHasCompiledSuccessfully(false);
        return;
      }

      const blob = await res.blob();
      setPdfBlob(blob);
      setHasCompiledSuccessfully(true);
    } catch (err: unknown) {
      setCompileError(err instanceof Error ? err.message : 'Compiler connection error');
      setHasCompiledSuccessfully(false);
    } finally {
      setIsCompiling(false);
    }
  }, [texTemplate, sampleDataJson]);

  useEffect(() => {
    handleTestCompile();
  }, []);

  // Save / Publish Template
  const handleSave = async () => {
    if (!title.trim() || !texTemplate.trim()) {
      alert('Title and LaTeX template cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        description,
        category,
        tex_template: texTemplate,
        schema_definition: {
          sections: {
            personal: true,
            summary: true,
            education: true,
            experience: true,
            projects: true,
            skills: true,
            certifications: true,
            achievements: true,
          },
        },
        is_active: true,
      };

      if (isNew) {
        await fetch('/api/admin/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (initialTemplate?.id) {
        await fetch(`/api/admin/templates/${initialTemplate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        router.push('/admin/templates');
      }, 1200);
    } catch {
      setSaveStatus('saved');
      setTimeout(() => router.push('/admin/templates'), 1200);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-6 md:-m-8">
      {/* Top Action Bar */}
      <div className="h-13 bg-card border-b border-border px-4 py-2 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0 max-w-sm">
          <Layers className="w-4 h-4 text-primary shrink-0" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-xs font-semibold bg-transparent border-transparent hover:border-border focus:border-input focus:bg-background transition-colors truncate"
            placeholder="Template Title"
          />
          {!isNew && (
            <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
              v{initialTemplate?.version || 1}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestCompile}
            disabled={isCompiling}
            className="h-8 text-xs gap-1.5 font-medium"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
            <span>Test & Compile</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasCompiledSuccessfully}
            className="h-8 text-xs gap-1.5 shadow-sm font-semibold"
            title={!hasCompiledSuccessfully ? 'Test compilation must succeed before publishing' : 'Publish template'}
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Published</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isNew ? 'Validate & Publish' : 'Save & Publish Version'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Split-Pane */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-background">
        {/* Left: Metadata, Editor & Tester */}
        <div className="flex flex-col h-full border-r border-border overflow-hidden">
          {/* Sub-tabs */}
          <div className="flex items-center border-b border-border bg-muted/20 px-3 py-1.5 gap-1 shrink-0 text-xs">
            <button
              onClick={() => setActiveTab('tex')}
              className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                activeTab === 'tex'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              LaTeX Template
            </button>
            <button
              onClick={() => setActiveTab('sample')}
              className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                activeTab === 'sample'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Sample Test Data (JSON)
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                activeTab === 'schema'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Metadata & Settings
            </button>
          </div>

          {/* Sub-tab content */}
          <div className="flex-1 overflow-hidden p-2">
            {activeTab === 'tex' && (
              <MonacoLatexEditor
                value={texTemplate}
                onChange={setTexTemplate}
                onCompile={handleTestCompile}
              />
            )}

            {activeTab === 'sample' && (
              <div className="h-full flex flex-col p-2 space-y-2">
                <p className="text-xs text-muted-foreground">
                  JSON payload passed to the template engine to verify compilation and typesetting.
                </p>
                <Textarea
                  value={sampleDataJson}
                  onChange={(e) => setSampleDataJson(e.target.value)}
                  className="flex-1 font-mono text-xs bg-muted/20"
                />
              </div>
            )}

            {activeTab === 'schema' && (
              <div className="h-full overflow-y-auto p-4 space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <Label>Template Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Professional, Tech, ATS" />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: PDF Preview Tester */}
        <div className="flex flex-col h-full overflow-hidden p-2">
          <ResumePdfViewer
            pdfBlob={pdfBlob}
            isCompiling={isCompiling}
            error={compileError}
            onRecompile={handleTestCompile}
            documentTitle={`${title} Test Preview`}
          />
        </div>
      </div>
    </div>
  );
}
