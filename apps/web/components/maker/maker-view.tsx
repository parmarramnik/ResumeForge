'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Play,
  Save,
  Download,
  FileCode,
  RotateCcw,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResumePdfViewer } from '@/components/pdf/resume-pdf-viewer';
import { INITIAL_RAW_TEX } from '@/lib/supabase/mock-data';
import { CompileErrorDetail, Resume } from '@resumeforge/shared-types';

interface MonacoEditorComponentProps {
  value: string;
  onChange: (val: string) => void;
  onCompile?: () => void;
  errors?: CompileErrorDetail[];
  theme?: 'vs-dark' | 'light';
  readOnly?: boolean;
  highlightLine?: number | null;
}

// Dynamically import Monaco editor to avoid SSR issues
const MonacoLatexEditor = dynamic<MonacoEditorComponentProps>(
  () => import('@/components/editor/monaco-latex-editor').then((mod) => mod.MonacoLatexEditor),
  { ssr: false, loading: () => <div className="h-full bg-[#1e1e1e] flex items-center justify-center text-xs text-muted-foreground font-mono">Loading Monaco LaTeX Editor...</div> }
);

interface MakerViewProps {
  initialResume?: Resume | null;
}

export function MakerView({ initialResume }: MakerViewProps) {
  const [title, setTitle] = useState<string>(initialResume?.title || 'Software Engineer Resume — Arjun Mehta');
  const [texContent, setTexContent] = useState<string>(
    initialResume?.raw_tex || INITIAL_RAW_TEX
  );
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileErrors, setCompileErrors] = useState<CompileErrorDetail[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [isErrorDrawerOpen, setIsErrorDrawerOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Check if opened from Generator
  useEffect(() => {
    const transferredTex = localStorage.getItem('resumeforge_maker_tex');
    if (transferredTex) {
      setTexContent(transferredTex);
      localStorage.removeItem('resumeforge_maker_tex');
    }
  }, []);

  // Compilation handler
  const handleCompile = useCallback(async () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setErrorMessage(null);
    setCompileErrors([]);

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tex: texContent, engine: 'tectonic' }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        const mainError = errorJson.error || 'Compilation failed';
        setErrorMessage(mainError);
        setCompileErrors(errorJson.errors || (errorJson.line ? [{ line: errorJson.line, message: mainError }] : []));
        setIsErrorDrawerOpen(true);
        return;
      }

      const blob = await res.blob();
      setPdfBlob(blob);
      setErrorMessage(null);
      setCompileErrors([]);
      setIsErrorDrawerOpen(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error compiling document');
      setIsErrorDrawerOpen(true);
    } finally {
      setIsCompiling(false);
    }
  }, [texContent, isCompiling]);

  // Initial compilation on mount
  useEffect(() => {
    handleCompile();
  }, []);

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          service_type: 'maker',
          raw_tex: texContent,
        }),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Export .tex file
  const handleExportTex = () => {
    const blob = new Blob([texContent], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetToTemplate = () => {
    if (window.confirm('Reset editor to default template? Unsaved changes will be lost.')) {
      setTexContent(INITIAL_RAW_TEX);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="h-14 border-b border-border bg-card/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <FileCode className="w-4 h-4 text-primary" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 w-72 text-xs font-semibold bg-transparent border-transparent hover:border-border focus:border-border px-2"
          />
          <Badge variant="outline" className="text-[10px] uppercase font-mono text-muted-foreground">
            Direct LaTeX IDE
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToTemplate}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            title="Reset code to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTex}
            className="h-8 text-xs gap-1.5 font-medium"
            title="Download .tex source code"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> .tex
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs gap-1.5 font-medium"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleCompile}
            disabled={isCompiling}
            className="h-8 text-xs gap-1.5 shadow-sm font-semibold bg-primary text-primary-foreground"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
            <span>{isCompiling ? 'Compiling...' : 'Compile (Ctrl+S)'}</span>
          </Button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Monaco Code Editor */}
        <div className="w-1/2 flex flex-col border-r border-border bg-[#1e1e1e]">
          <div className="flex-1 overflow-hidden">
            <MonacoLatexEditor
              value={texContent}
              onChange={(val) => setTexContent(val || '')}
              onCompile={handleCompile}
              errors={compileErrors}
              highlightLine={highlightLine}
            />
          </div>

          {/* Diagnostic Error Drawer */}
          {errorMessage && (
            <div className="border-t border-destructive/30 bg-destructive/10 text-xs">
              <div
                className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-destructive/20 select-none"
                onClick={() => setIsErrorDrawerOpen(!isErrorDrawerOpen)}
              >
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Compilation Diagnostic ({compileErrors.length} issues)</span>
                </div>
                {isErrorDrawerOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {isErrorDrawerOpen && (
                <div className="px-4 pb-3 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                  <p className="text-destructive font-semibold">{errorMessage}</p>
                  {compileErrors.map((err, idx) => (
                    <div
                      key={idx}
                      onClick={() => setHighlightLine(err.line ?? null)}
                      className="p-1.5 rounded bg-background/50 border border-destructive/20 hover:border-destructive text-foreground cursor-pointer flex items-center justify-between"
                    >
                      <span>{err.message}</span>
                      {err.line && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground font-bold">
                          Line {err.line}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Pane: High Performance PDF Viewer */}
        <div className="w-1/2 flex flex-col bg-muted/30 overflow-hidden">
          <ResumePdfViewer
            pdfBlob={pdfBlob}
            isLoading={isCompiling}
            errorMessage={errorMessage}
            onRetry={handleCompile}
          />
        </div>
      </div>
    </div>
  );
}
