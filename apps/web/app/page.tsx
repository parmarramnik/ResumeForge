import React from 'react';
import Link from 'next/link';
import {
  FileCode2,
  Code,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  FileCheck,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
            <FileCode2 className="w-4 h-4" />
          </div>
          <span>ResumeForge</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a href="#services" className="hover:text-foreground transition-colors">Services</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          <a href="#templates" className="hover:text-foreground transition-colors">Templates</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="text-xs font-medium shadow-sm">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium">
          <Badge variant="outline" className="text-[10px] font-mono">NEW</Badge>
          <span>Isolated Tectonic Compiler Sandbox & AST Template Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.12]">
          Create your resume your way.
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Write LaTeX directly in a high-performance IDE or generate an ATS-optimized resume from structured information powered by administrator-controlled templates.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/maker">
            <Button size="lg" className="h-11 px-6 text-sm font-semibold gap-2 shadow-sm">
              <Code className="w-4 h-4" />
              <span>Resume Maker (LaTeX IDE)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/generator">
            <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-semibold gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Resume Generator (Form Wizard)</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Two Services Comparison */}
      <section id="services" className="py-16 bg-muted/20 border-y border-border px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Two Architecturally Distinct Services</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Choose between complete LaTeX control or structured template generation with zero code required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service 1: Maker */}
            <Card className="p-8 border-border bg-card shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <Badge variant="outline" className="font-mono text-[10px]">SERVICE 1</Badge>
                  <h3 className="text-xl font-bold mt-2">Resume Maker</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Designed for engineers and LaTeX practitioners who require complete control over formatting, macros, packages, section layout, and typesetting.
                  </p>
                </div>

                <ul className="space-y-2 text-xs font-medium text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Monaco editor with LaTeX syntax highlighting & folding
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Instant compilation via isolated Tectonic sandbox
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Real-time error parser with line number diagnostics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    One-click export to compiled PDF or raw <span className="font-mono">.tex</span>
                  </li>
                </ul>
              </div>

              <Link href="/maker">
                <Button className="w-full text-xs font-semibold" size="sm">
                  Launch Resume Maker
                </Button>
              </Link>
            </Card>

            {/* Service 2: Generator */}
            <Card className="p-8 border-border bg-card shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <Badge variant="success" className="font-mono text-[10px]">SERVICE 2</Badge>
                  <h3 className="text-xl font-bold mt-2">Resume Generator</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Author professional resumes through a multi-step structured wizard powered by admin-approved, high-score ATS templates.
                  </p>
                </div>

                <ul className="space-y-2 text-xs font-medium text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Admin-controlled master LaTeX templates with versioning
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Dynamic repeatable sections (Experience, Projects, Education)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Automatic LaTeX escaping sanitization preventing syntax errors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    One-click &quot;Open in Maker&quot; to inspect and customize LaTeX
                  </li>
                </ul>
              </div>

              <Link href="/generator">
                <Button variant="outline" className="w-full text-xs font-semibold" size="sm">
                  Launch Resume Generator
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Isolation Section */}
      <section id="security" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Trust Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Enterprise-Grade Security & Isolation</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Never execute arbitrary user code directly on the application server.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 bg-card border-border">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm">Containerized Sandbox</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every compile job runs in a dedicated ephemeral directory under non-root permissions with strict memory, CPU, and 8s execution limits.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-card border-border">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm">Strict LaTeX Sanitization</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              User fields inserted into generator templates are rigorously escaped. Subprocesses are run with <span className="font-mono">--no-shell-escape</span>.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-card border-border">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm">PostgreSQL Row-Level Security</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All database operations are governed by Supabase RLS policies and server-side RBAC checks preventing unauthorized cross-tenant data access.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card/60 px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">
              RF
            </div>
            <span className="font-semibold text-foreground">ResumeForge</span>
            <span>-- Production LaTeX Resume Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/maker" className="hover:text-foreground transition-colors">Resume Maker</Link>
            <Link href="/generator" className="hover:text-foreground transition-colors">Resume Generator</Link>
            <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
