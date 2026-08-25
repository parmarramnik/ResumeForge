'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  GripVertical,
  Minus,
  Plus,
} from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResumePdfViewer } from '@/components/pdf/resume-pdf-viewer';
import { INITIAL_RAW_TEX } from '@/lib/supabase/mock-data';
import { CompileErrorDetail, Resume } from '@resumeforge/shared-types';
import { useTheme } from '@/components/theme/theme-provider';

interface MonacoEditorComponentProps {
  value: string;
  onChange: (val: string) => void;
  onCompile?: () => void;
  errors?: CompileErrorDetail[];
  theme?: 'vs-dark' | 'light' | 'vs';
  fontSize?: number;
  readOnly?: boolean;
  highlightLine?: number | null;
}

// Dynamically import Monaco editor to avoid SSR issues
const MonacoLatexEditor = dynamic<MonacoEditorComponentProps>(
  () => import('@/components/editor/monaco-latex-editor').then((mod) => mod.MonacoLatexEditor),
  { ssr: false, loading: () => <div className="h-full bg-background flex items-center justify-center text-xs text-muted-foreground font-mono">Loading Code Editor...</div> }
);

interface MakerViewProps {
  initialResume?: Resume | null;
}

export function MakerView({ initialResume }: MakerViewProps) {
  const { theme } = useTheme();
  const [title, setTitle] = useState<string>(initialResume?.title || 'Professional Resume — Draft');
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
  const [fontSize, setFontSize] = useState<number>(14);

  const abortControllerRef = useRef<AbortController | null>(null);
  const localBlobCacheRef = useRef<Map<string, Blob>>(new Map());

  // Load editor preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem('resumeforge_editor_fontsize');
      if (savedFontSize) {
        setFontSize(Number(savedFontSize) || 14);
      }
    }
  }, []);

  const handleUpdateFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.max(10, Math.min(28, prev + delta));
      if (typeof window !== 'undefined') {
        localStorage.setItem('resumeforge_editor_fontsize', String(next));
      }
      return next;
    });
  };

  // Check if opened from Generator
  useEffect(() => {
    const transferredTex = localStorage.getItem('resumeforge_maker_tex');
    if (transferredTex) {
      setTexContent(transferredTex);
      localStorage.removeItem('resumeforge_maker_tex');
    }
  }, []);

  // Compilation handler with AbortController & Instant Cache
  const handleCompile = useCallback(async () => {
    const currentCode = texContent;
    if (!currentCode) return;

    // Check instant client cache
    const cachedBlob = localBlobCacheRef.current.get(currentCode);
    if (cachedBlob) {
      setPdfBlob(cachedBlob);
      setCompileErrors([]);
      setErrorMessage(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsCompiling(true);
    setCompileErrors([]);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tex: currentCode, engine: 'pdflatex' }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errData;
        try {
          errData = await res.json();
        } catch {
          errData = { error: 'Compilation failed' };
        }
        setErrorMessage(errData.error || 'Compilation failed');
        setCompileErrors(errData.details || []);
        setIsErrorDrawerOpen(true);
        return;
      }

      const blob = await res.blob();
      localBlobCacheRef.current.set(currentCode, blob);
      setPdfBlob(blob);
      setCompileErrors([]);
      setErrorMessage(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setErrorMessage('Network or server error during compilation.');
      setIsErrorDrawerOpen(true);
    } finally {
      setIsCompiling(false);
    }
  }, [texContent]);

  // Initial compilation on mount
  useEffect(() => {
    handleCompile();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [handleCompile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (initialResume?.id) {
        await fetch(`/api/resumes/${initialResume.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, raw_tex: texContent }),
        });
      } else {
        await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, raw_tex: texContent, mode: 'latex' }),
        });
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportTex = () => {
    const blob = new Blob([texContent], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_') || 'resume'}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetToTemplate = () => {
    if (window.confirm('Reset code editor to original standard LaTeX template? Any unsaved edits will be replaced.')) {
      setTexContent(INITIAL_RAW_TEX);
      localBlobCacheRef.current.clear();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background overflow-hidden select-none">
      {/* Top IDE Toolbar */}
      <div className="h-12 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-foreground" />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-7 text-xs font-semibold w-52 md:w-64 bg-transparent border-transparent hover:border-border focus:border-border focus:bg-background px-2"
            />
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono border-border">
            LATEX IDE
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size Adjuster in Toolbar */}
          <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-md px-1.5 py-0.5" title="Adjust Editor Font Size (or use Ctrl+Wheel)">
            <button
              onClick={() => handleUpdateFontSize(-1)}
              disabled={fontSize <= 10}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
              title="Decrease Font Size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono text-[11px] font-medium px-1 text-foreground">
              {fontSize}px
            </span>
            <button
              onClick={() => handleUpdateFontSize(1)}
              disabled={fontSize >= 28}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
              title="Increase Font Size"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

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
                <Check className="w-3.5 h-3.5 text-foreground" />
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
            className="h-8 text-xs gap-1.5 shadow-sm font-semibold bg-foreground text-background hover:bg-foreground/90"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
            <span>{isCompiling ? 'Compiling...' : 'Compile (Ctrl+S)'}</span>
          </Button>
        </div>
      </div>

      {/* Main Split-Pane Workspace with Overleaf-Style Draggable Resizer */}
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Left Pane: Monaco Code Editor */}
        <Panel defaultSize={50} minSize={20} className="flex flex-col bg-background overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MonacoLatexEditor
              value={texContent}
              onChange={(val) => setTexContent(val || '')}
              onCompile={handleCompile}
              errors={compileErrors}
              fontSize={fontSize}
              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
              highlightLine={highlightLine}
            />
          </div>

          {/* Diagnostic Error Drawer */}
          {errorMessage && (
            <div className="border-t border-border bg-card text-xs">
              <div
                className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-muted select-none"
                onClick={() => setIsErrorDrawerOpen(!isErrorDrawerOpen)}
              >
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-foreground" />
                  <span className="text-foreground font-semibold">LaTeX Compilation Output</span>
                </div>
                {isErrorDrawerOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {isErrorDrawerOpen && (
                <div className="p-3 bg-muted/40 border-t border-border max-h-48 overflow-y-auto font-mono text-[11px] space-y-1.5">
                  <div className="text-foreground font-medium">{errorMessage}</div>
                  {compileErrors.map((err, i) => (
                    <div
                      key={i}
                      onClick={() => setHighlightLine(err.line || null)}
                      className="p-1.5 rounded bg-background border border-border flex items-start justify-between cursor-pointer hover:border-foreground"
                    >
                      <span className="text-foreground">{err.message}</span>
                      {err.line && (
                        <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                          Line {err.line}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>

        {/* Draggable Divider Handle */}
        <PanelResizeHandle className="w-1.5 bg-border hover:bg-foreground/50 transition-colors flex items-center justify-center cursor-col-resize group select-none">
          <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </PanelResizeHandle>

        {/* Right Pane: Embedded PDF Viewer */}
        <Panel defaultSize={50} minSize={20} className="flex flex-col bg-muted/20 overflow-hidden">
          <ResumePdfViewer pdfBlob={pdfBlob} isCompiling={isCompiling} />
        </Panel>
      </PanelGroup>
    </div>
  );
}
