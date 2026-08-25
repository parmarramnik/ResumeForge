import React from 'react';
import Link from 'next/link';
import {
  FileCode2,
  Code,
  FileEdit,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-border bg-card sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-md bg-foreground text-background flex items-center justify-center font-bold">
            <FileCode2 className="w-4 h-4" />
          </div>
          <span>ResumeForge</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a href="#services" className="hover:text-foreground transition-colors">Services</a>
          <a href="#features" className="hover:text-foreground transition-colors">Architecture</a>
          <a href="#security" className="hover:text-foreground transition-colors">Security</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="text-xs font-medium bg-foreground text-background hover:bg-foreground/90">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs font-medium">
          <Badge variant="outline" className="text-[10px] font-mono border-border">LATEX ENGINE</Badge>
          <span>Isolated TeX Live Compiler & High-Performance ATS Templates</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Precision LaTeX Resume Platform
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Author raw LaTeX directly inside Monaco IDE or construct ATS-optimized resumes using a structured multi-step form editor.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/maker">
            <Button size="lg" className="h-11 px-6 text-sm font-semibold gap-2 bg-foreground text-background hover:bg-foreground/90">
              <Code className="w-4 h-4" />
              <span>Resume Maker (LaTeX IDE)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/generator">
            <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-semibold gap-2 border-border">
              <FileEdit className="w-4 h-4" />
              <span>Resume Generator (Form Wizard)</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Two Services Comparison */}
      <section id="services" className="py-16 bg-muted/20 border-y border-border px-6 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Two Focused Workspaces</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Choose between complete LaTeX control or structured template authoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service 1: Maker */}
            <Card className="p-8 border-border bg-card shadow-none space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center font-bold">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <Badge variant="outline" className="font-mono text-[10px] border-border">SERVICE 1</Badge>
                  <h3 className="text-lg font-bold mt-2">Resume Maker</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Designed for engineers and LaTeX practitioners who require complete control over formatting, macros, packages, and single-page ATS layout.
                  </p>
                </div>

                <ul className="space-y-2 text-xs font-medium text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                    Monaco editor with LaTeX syntax highlighting & line folding
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                    Instant sub-second compilation via native pdflatex engine
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                    Real-time error parser with line number diagnostics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                    Draggable Overleaf-style split pane layout
                  </li>
                </ul>
              </div>

              <Link href="/maker">
                <Button className="w-full text-xs font-semibold bg-foreground text-background hover:bg-foreground/90" size="sm">
                  Launch Resume Maker
                </Button>
              </Link>
            </Card>

            {/* Service 2: Generator */}
            <Card className="p-8 border-border bg-card shadow-none space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center font-bold">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <Badge variant="outline" className="font-mono text-[10px] border-border">SERVICE 2</Badge>
                  <h3 className="text-lg font-bold mt-2">Resume Generator</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Author professional resumes through a 7-step structured form wizard powered by ATS-standard single-page templates.
                  </p>
                </div>

                <ul className="space-y-2 text-xs font-medium text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                    Admin-controlled master LaTeX templates with versioning
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                    Dynamic repeatable sections (Education, Skills, Experience, Projects)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                    Automatic LaTeX escaping sanitization preventing syntax errors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                    One-click &quot;Open in Maker&quot; to inspect and customize LaTeX
                  </li>
                </ul>
              </div>

              <Link href="/generator">
                <Button variant="outline" className="w-full text-xs font-semibold border-border" size="sm">
                  Launch Resume Generator
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Isolation Section */}
      <section id="security" className="py-20 px-6 lg:px-12 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Trust Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Engine Isolation & Security</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Secure, isolated execution sandbox with strict resource limits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 bg-card border-border shadow-none">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-foreground">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm">Containerized Sandbox</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every compile job executes in a dedicated ephemeral directory under non-root permissions with strict memory and CPU limits.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-card border-border shadow-none">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-foreground">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm">Strict LaTeX Sanitization</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              User fields inserted into generator templates are rigorously escaped. Subprocesses are run with <span className="font-mono">--no-shell-escape</span>.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-card border-border shadow-none">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-foreground">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm">PostgreSQL Row-Level Security</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All database operations are governed by Supabase RLS policies and server-side RBAC checks preventing cross-tenant access.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card px-6 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-foreground text-background flex items-center justify-center font-bold text-[10px]">
              RF
            </div>
            <span className="font-semibold text-foreground">ResumeForge</span>
            <span>-- Production LaTeX Resume Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/maker" className="hover:text-foreground transition-colors">Resume Maker</Link>
            <Link href="/generator" className="hover:text-foreground transition-colors">Resume Generator</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
