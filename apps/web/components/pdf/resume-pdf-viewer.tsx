'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  RotateCw,
  FileText,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResumePdfViewerProps {
  pdfUrl?: string | null;
  pdfBlob?: Blob | null;
  isCompiling?: boolean;
  isLoading?: boolean;
  error?: string | null;
  errorMessage?: string | null;
  className?: string;
  onRecompile?: () => void;
  onRetry?: () => void;
  documentTitle?: string;
}

export function ResumePdfViewer({
  pdfUrl,
  pdfBlob,
  isCompiling = false,
  isLoading = false,
  error = null,
  errorMessage = null,
  className,
  onRecompile,
  onRetry,
  documentTitle = 'Resume',
}: ResumePdfViewerProps) {
  const compiling = isCompiling || isLoading;
  const activeError = error || errorMessage;
  const handleRetry = onRecompile || onRetry;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Manage Blob URL lifecycle
  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setBlobUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setBlobUrl(null);
    }
  }, [pdfBlob]);

  const activeUrl = blobUrl || pdfUrl;

  const handleDownload = () => {
    if (!activeUrl) return;
    const a = document.createElement('a');
    a.href = activeUrl;
    a.download = `${documentTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInTab = () => {
    if (!activeUrl) return;
    window.open(activeUrl, '_blank');
  };

  return (
    <div className={cn('flex flex-col h-full bg-muted/40 border-l border-border select-none', className)}>
      {/* Viewer Action Toolbar */}
      <div className="h-10 px-4 border-b border-border bg-card/60 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>PDF Preview</span>
          {compiling && (
            <span className="flex items-center gap-1 text-[11px] text-primary animate-pulse ml-2 font-mono">
              <Loader2 className="w-3 h-3 animate-spin" />
              Rendering...
            </span>
          )}
        </div>

        {/* Zoom & Download Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-none text-muted-foreground hover:text-foreground"
              onClick={() => setZoom((prev) => Math.max(50, prev - 15))}
              disabled={!activeUrl}
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="px-2 text-[11px] font-mono text-muted-foreground min-w-[42px] text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-none text-muted-foreground hover:text-foreground"
              onClick={() => setZoom((prev) => Math.min(180, prev + 15))}
              disabled={!activeUrl}
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setZoom(100)}
            disabled={!activeUrl}
            title="Reset Zoom"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs gap-1 font-medium ml-1"
            onClick={handleDownload}
            disabled={!activeUrl}
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Download</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleOpenInTab}
            disabled={!activeUrl}
            title="Open in new tab"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Main Document Display Area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-muted/20">
        {compiling && !activeUrl && (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-medium">Typesetting PDF with isolated compiler...</p>
          </div>
        )}

        {activeError && (
          <div className="max-w-md w-full p-6 rounded-lg border border-destructive/30 bg-destructive/5 text-center space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-destructive">Compilation Failed</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3 font-mono">
                {activeError}
              </p>
            </div>
            {handleRetry && (
              <Button size="sm" variant="outline" onClick={handleRetry} className="text-xs gap-1.5">
                <RotateCw className="w-3 h-3" />
                Retry Compilation
              </Button>
            )}
          </div>
        )}

        {!compiling && !activeError && !activeUrl && (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground text-center max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/60 border border-border">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">No Document Rendered</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Enter your details on the left and click &quot;Update Preview&quot; or press Ctrl+S to compile.
              </p>
            </div>
          </div>
        )}

        {activeUrl && (
          <div
            className="transition-transform duration-150 shadow-lg bg-white rounded flex items-center justify-center overflow-hidden"
            style={{
              width: `${Math.round(595 * (zoom / 100))}px`,
              height: `${Math.round(842 * (zoom / 100))}px`,
            }}
          >
            <iframe
              ref={iframeRef}
              src={`${activeUrl}#toolbar=0&navpanes=0`}
              title="Resume Preview"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}
