'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Play,
  Save,
  Download,
  FileCode,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Layers,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResumePdfViewer } from '@/components/pdf/resume-pdf-viewer';
import { INITIAL_TEMPLATES } from '@/lib/supabase/mock-data';
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
  const [title, setTitle] = useState<string>(initialResume?.title || 'Senior Software Engineer Resume');
  const [texContent, setTexContent] = useState<string>(
    initialResume?.raw_tex || INITIAL_TEMPLATES[0].tex_template
  );
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileErrors, setCompileErrors] = useState<CompileErrorDetail[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [isErrorDrawerOpen, setIsErrorDrawerOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

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
      // Local fallback
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Download .tex handler
  const handleDownloadTex = () => {
    const blob = new Blob([texContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load starting template preset
  const handleLoadTemplatePreset = (tId: string) => {
    const tmpl = INITIAL_TEMPLATES.find((t) => t.id === tId);
    if (tmpl && confirm('Replace current editor contents with selected template preset?')) {
      setTexContent(tmpl.tex_template);
      setTitle(`${tmpl.title} Resume`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-6 md:-m-8">
      {/* IDE Action Bar */}
      <div className="h-13 bg-card border-b border-border px-4 py-2 flex items-center justify-between gap-3 shrink-0">
        {/* Title Input */}
        <div className="flex items-center gap-2 min-w-0 max-w-sm">
          <FileCode className="w-4 h-4 text-primary shrink-0" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-xs font-medium bg-transparent border-transparent hover:border-border focus:border-input focus:bg-background transition-colors truncate"
            placeholder="Untitled Resume"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Template Presets Selector */}
          <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground mr-2">
            <Layers className="w-3.5 h-3.5" />
            <select
              className="text-xs bg-muted/50 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring text-foreground font-medium"
              onChange={(e) => handleLoadTemplatePreset(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Presets...</option>
              {INITIAL_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTex}
            className="h-8 text-xs gap-1.5"
            title="Download LaTeX Source"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .tex</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs gap-1.5"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleCompile}
            disabled={isCompiling}
            className="h-8 text-xs gap-1.5 shadow-sm font-semibold bg-primary hover:bg-primary/90"
            title="Compile LaTeX (Ctrl+S / Cmd+S)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Compile</span>
            <kbd className="hidden md:inline-block ml-1 px-1 py-0.2 rounded bg-primary-foreground/20 text-[10px] font-mono">
              Ctrl+S
            </kbd>
          </Button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-background">
        {/* Left: Monaco LaTeX Editor + Error Drawer */}
        <div className="flex flex-col h-full border-r border-border overflow-hidden">
          <div className="flex-1 overflow-hidden p-2">
            <MonacoLatexEditor
              value={texContent}
              onChange={setTexContent}
              onCompile={handleCompile}
              errors={compileErrors}
              highlightLine={highlightLine}
            />
          </div>

          {/* Compiler Diagnostics Drawer */}
          {errorMessage && (
            <div className="border-t border-destructive/30 bg-destructive/5 shrink-0 transition-all">
              <div
                className="flex items-center justify-between px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-semibold cursor-pointer select-none"
                onClick={() => setIsErrorDrawerOpen(!isErrorDrawerOpen)}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Compiler Diagnostics ({compileErrors.length || 1} issue{compileErrors.length > 1 ? 's' : ''})</span>
                </div>
                {isErrorDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </div>

              {isErrorDrawerOpen && (
                <div className="p-3 max-h-36 overflow-y-auto space-y-1.5 font-mono text-xs text-foreground">
                  <p className="text-destructive font-medium text-[11px]">{errorMessage}</p>
                  {compileErrors.map((err, idx) => (
                    <div
                      key={idx}
                      onClick={() => err.line && setHighlightLine(err.line)}
                      className="p-1.5 rounded bg-muted/60 hover:bg-muted cursor-pointer flex items-center justify-between text-[11px] border border-border/50"
                    >
                      <span className="truncate">{err.message}</span>
                      {err.line && (
                        <Badge variant="destructive" className="ml-2 font-mono text-[9px] px-1 py-0 h-4">
                          Line {err.line}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: PDF Viewer */}
        <div className="flex flex-col h-full overflow-hidden p-2">
          <ResumePdfViewer
            pdfBlob={pdfBlob}
            isCompiling={isCompiling}
            error={errorMessage}
            onRecompile={handleCompile}
            documentTitle={title}
          />
        </div>
      </div>
    </div>
  );
}
