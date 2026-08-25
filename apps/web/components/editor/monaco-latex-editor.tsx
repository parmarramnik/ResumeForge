'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { CompileErrorDetail } from '@resumeforge/shared-types';

interface MonacoLatexEditorProps {
  value: string;
  onChange: (val: string) => void;
  onCompile?: () => void;
  errors?: CompileErrorDetail[];
  theme?: 'vs-dark' | 'vs' | 'light' | 'dark';
  fontSize?: number;
  readOnly?: boolean;
  highlightLine?: number | null;
}

export function MonacoLatexEditor({
  value,
  onChange,
  onCompile,
  errors = [],
  theme = 'vs',
  fontSize = 13,
  readOnly = false,
  highlightLine = null,
}: MonacoLatexEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;

    // Register LaTeX compile shortcut (Ctrl+S / Cmd+S)
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onCompile) {
        onCompile();
      }
    });

    // Formatting & editor configuration
    ed.updateOptions({
      fontSize: fontSize || 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
      lineHeight: Math.round((fontSize || 13) * 1.55),
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      folding: true,
      renderLineHighlight: 'all',
      tabSize: 2,
      mouseWheelZoom: true,
    });
  };

  // Update font size dynamically whenever fontSize prop changes
  useEffect(() => {
    if (editorRef.current && fontSize) {
      editorRef.current.updateOptions({
        fontSize,
        lineHeight: Math.round(fontSize * 1.55),
      });
    }
  }, [fontSize]);

  // Jump to highlighted line on error click
  useEffect(() => {
    if (editorRef.current && highlightLine && highlightLine > 0) {
      editorRef.current.revealLineInCenter(highlightLine);
      editorRef.current.setPosition({ lineNumber: highlightLine, column: 1 });
      editorRef.current.focus();
    }
  }, [highlightLine]);

  // Set line error decorations
  useEffect(() => {
    if (!editorRef.current) return;

    const editorInstance = editorRef.current;
    const model = editorInstance.getModel();
    if (!model) return;

    if (errors.length > 0) {
      const newDecorations: editor.IModelDeltaDecoration[] = errors
        .filter((e) => e.line && e.line > 0)
        .map((e) => ({
          range: {
            startLineNumber: e.line!,
            startColumn: 1,
            endLineNumber: e.line!,
            endColumn: 100,
          },
          options: {
            isWholeLine: true,
            className: 'bg-destructive/20 border-b border-destructive',
            glyphMarginClassName: 'text-destructive font-bold',
            hoverMessage: { value: `**LaTeX Error:** ${e.message}` },
          },
        }));

      decorationsRef.current = editorInstance.deltaDecorations(decorationsRef.current, newDecorations);
    } else {
      decorationsRef.current = editorInstance.deltaDecorations(decorationsRef.current, []);
    }
  }, [errors]);

  const monacoTheme = theme === 'dark' || theme === 'vs-dark' ? 'vs-dark' : 'vs';

  return (
    <div className="w-full h-full border-r border-border overflow-hidden bg-background">
      <Editor
        height="100%"
        defaultLanguage="latex"
        language="latex"
        theme={monacoTheme}
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          mouseWheelZoom: true,
        }}
      />
    </div>
  );
}
