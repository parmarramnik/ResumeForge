'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
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
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div className={cn('flex flex-col h-full bg-muted/40 border-l border-border select-none overflow-hidden', className)}>
      {/* Viewer Action Toolbar */}
      <div className="h-10 px-4 border-b border-border bg-card/60 flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <FileText className="w-3.5 h-3.5 text-foreground" />
          <span className="font-semibold text-foreground">PDF Preview</span>
          {compiling && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin text-foreground" />
              <span>Rendering...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Controls */}
          <div className="flex items-center bg-card border border-border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-none text-muted-foreground hover:text-foreground"
              onClick={() => setZoom((prev) => Math.max(50, prev - 10))}
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
              onClick={() => setZoom((prev) => Math.min(180, prev + 10))}
              disabled={!activeUrl}
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs gap-1 font-medium ml-1 border-border"
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

      {/* Main Preview Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 flex flex-col items-center justify-start bg-muted/20 relative"
      >
        {/* Loading Overlay */}
        {compiling && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 z-20 transition-all">
            <Loader2 className="w-6 h-6 animate-spin text-foreground" />
            <span className="text-xs font-medium text-foreground">Compiling PDF...</span>
          </div>
        )}

        {/* Error Notification Banner */}
        {activeError && !compiling && (
          <div className="w-full max-w-xl mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-semibold">Compilation Error</h4>
              <p className="text-xs opacity-90 leading-relaxed font-mono whitespace-pre-wrap">
                {activeError}
              </p>
            </div>
            {handleRetry && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-destructive/30 hover:bg-destructive/20 text-destructive flex-shrink-0 gap-1"
                onClick={handleRetry}
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </Button>
            )}
          </div>
        )}

        {/* Rendered PDF Document */}
        {activeUrl ? (
          <div
            className="transition-transform duration-150 origin-top shadow-xl rounded-md overflow-hidden bg-white border border-border"
            style={{
              width: `${(595 * zoom) / 100}px`,
              height: `${(842 * zoom) / 100}px`,
              maxWidth: 'none',
            }}
          >
            <iframe
              ref={iframeRef}
              src={`${activeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              className="w-full h-full border-none pointer-events-auto"
              title="Resume Preview"
            />
          </div>
        ) : !compiling && !activeError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center max-w-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground border border-border">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">No Document Rendered</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click <span className="font-semibold text-foreground">"Compile (Ctrl+S)"</span> or update your form details to generate a preview.
              </p>
            </div>
            {handleRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="text-xs gap-1.5 font-medium border-border"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Compile Now</span>
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
