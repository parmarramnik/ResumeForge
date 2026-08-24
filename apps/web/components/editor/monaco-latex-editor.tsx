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
  theme?: 'vs-dark' | 'light';
  readOnly?: boolean;
  highlightLine?: number | null;
}

export function MonacoLatexEditor({
  value,
  onChange,
  onCompile,
  errors = [],
  theme = 'vs-dark',
  readOnly = false,
  highlightLine = null,
}: MonacoLatexEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;

    // Register LaTeX snippets and syntax customizations if needed
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onCompile) {
        onCompile();
      }
    });

    // Formatting & editor configuration
    ed.updateOptions({
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
      lineHeight: 20,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      folding: true,
      renderLineHighlight: 'all',
      tabSize: 2,
    });
  };

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

  return (
    <div className="w-full h-full border border-border rounded-lg overflow-hidden bg-[#1e1e1e]">
      <Editor
        height="100%"
        defaultLanguage="latex"
        language="latex"
        theme={theme}
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
