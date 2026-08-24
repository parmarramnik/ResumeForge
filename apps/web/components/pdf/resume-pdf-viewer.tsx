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
  error?: string | null;
  className?: string;
  onRecompile?: () => void;
  documentTitle?: string;
}

export function ResumePdfViewer({
  pdfUrl,
  pdfBlob,
  isCompiling = false,
  error = null,
  className,
  onRecompile,
  documentTitle = 'Resume',
}: ResumePdfViewerProps) {
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
    } else if (pdfUrl) {
      setBlobUrl(pdfUrl);
    } else {
      setBlobUrl(null);
    }
  }, [pdfBlob, pdfUrl]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 50));
  const handleZoomReset = () => setZoom(100);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${documentTitle.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenExternal = () => {
    if (!blobUrl) return;
    window.open(blobUrl, '_blank');
  };

  return (
    <div className={cn('flex flex-col h-full bg-slate-900/5 dark:bg-slate-950 border border-border rounded-lg overflow-hidden', className)}>
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-background/95 border-b border-border text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <FileText className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline font-mono">PDF Preview</span>
          {blobUrl && <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted">Ready</span>}
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <div className="flex items-center bg-muted/60 rounded-md p-0.5 border border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleZoomOut}
              disabled={!blobUrl || zoom <= 50}
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="px-2 text-[11px] font-mono min-w-[3rem] text-center font-medium">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleZoomIn}
              disabled={!blobUrl || zoom >= 200}
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleZoomReset}
              disabled={!blobUrl || zoom === 100}
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Action buttons */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={handleDownload}
            disabled={!blobUrl}
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleOpenExternal}
            disabled={!blobUrl}
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 bg-slate-200/50 dark:bg-slate-900/50 overflow-auto flex items-center justify-center p-4">
        {/* Loading / Compiling Overlay */}
        {isCompiling && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold">Compiling LaTeX...</p>
              <p className="text-xs text-muted-foreground mt-0.5">Isolated sandbox compilation in progress</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isCompiling && error && (
          <div className="max-w-md w-full p-6 bg-card border border-destructive/30 rounded-xl shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-destructive">Compilation Failed</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3 font-mono bg-muted/50 p-2 rounded border border-border/50 text-left">
                {error}
              </p>
            </div>
            {onRecompile && (
              <Button size="sm" variant="outline" onClick={onRecompile} className="gap-1.5 text-xs">
                <RotateCw className="w-3.5 h-3.5" />
                Retry Compilation
              </Button>
            )}
          </div>
        )}

        {/* Empty / Initial State */}
        {!isCompiling && !error && !blobUrl && (
          <div className="text-center p-8 space-y-3 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-medium">No PDF Generated Yet</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Click Compile or press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">Ctrl+S</kbd> to render your resume.
              </p>
            </div>
            {onRecompile && (
              <Button size="sm" onClick={onRecompile} className="gap-1.5 text-xs">
                <RotateCw className="w-3.5 h-3.5" />
                Compile Now
              </Button>
            )}
          </div>
        )}

        {/* PDF Document Container */}
        {!isCompiling && !error && blobUrl && (
          <div
            className="transition-transform duration-150 ease-out origin-top shadow-2xl rounded bg-white flex items-center justify-center overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              width: '100%',
              height: '100%',
              maxWidth: '850px',
              minHeight: '700px',
            }}
          >
            <iframe
              ref={iframeRef}
              src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0 min-h-[750px] bg-white"
              title="Resume PDF"
            />
          </div>
        )}
      </div>
    </div>
  );
}
