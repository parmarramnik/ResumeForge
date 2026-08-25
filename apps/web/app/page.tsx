import React from 'react';
import Link from 'next/link';
import {
  FileCode2,
  Code,
  FileEdit,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Download,
  FileCheck,
  Shield,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-muted">
      {/* Top Navigation */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm">
            <FileCode2 className="w-4.5 h-4.5" />
          </div>
          <span>ResumeForge</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-muted-foreground">
          <a href="#services" className="hover:text-foreground transition-colors">Our Services</a>
          <a href="#benefits" className="hover:text-foreground transition-colors">Why ResumeForge</a>
          <a href="#faq" className="hover:text-foreground transition-colors">Questions & Answers</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-medium h-8">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-xs font-semibold h-8 bg-foreground text-background hover:bg-foreground/90 shadow-sm">
              Create Free Account
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/30 text-xs text-muted-foreground font-medium">
          <Sparkles className="w-3.5 h-3.5 text-foreground" />
          <span>Professional Resume Creation — 100% Free & ATS-Ready</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
          Build standout resumes with simplicity and precision.
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Whether you love writing LaTeX code with full formatting control or prefer filling out an easy step-by-step form, ResumeForge makes building single-page resumes fast, elegant, and stress-free.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link href="/register">
            <Button size="lg" className="h-11 px-6 text-xs sm:text-sm font-semibold gap-2 bg-foreground text-background hover:bg-foreground/90 shadow">
              <span>Start Building Your Resume</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-11 px-6 text-xs sm:text-sm font-medium border-border">
              Sign In to Your Workspace
            </Button>
          </Link>
        </div>
      </section>

      {/* Two Core Services Overview */}
      <section id="services" className="py-20 bg-muted/20 border-y border-border px-6 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Two Tailored Resume Services</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Pick the workflow that fits your background and style best.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service 1: Resume Maker */}
            <Card className="p-8 border-border bg-card shadow-sm rounded-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">Service 1</span>
                  <h3 className="text-xl font-bold mt-1 text-foreground">Resume Maker (Code Editor)</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Designed for developers, engineers, and researchers who want full control over their LaTeX syntax, packages, custom macros, and exact document layout.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-muted-foreground pt-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <span>Monaco code editor with syntax highlighting and keyboard shortcuts (<kbd className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">Ctrl+S</kbd>).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <span>Real-time PDF rendering with side-by-side interactive split preview.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <span>Adjustable in-editor font sizing and quick template reset.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <span>Download your compiled PDF or export the raw <code className="font-mono text-[11px]">.tex</code> source code anytime.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/login?redirect=/maker">
                  <Button className="w-full text-xs font-semibold h-9 bg-foreground text-background hover:bg-foreground/90">
                    Sign In to Use Resume Maker
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Service 2: Resume Generator */}
            <Card className="p-8 border-border bg-card shadow-sm rounded-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">Service 2</span>
                  <h3 className="text-xl font-bold mt-1 text-foreground">Resume Generator (Form Wizard)</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Designed for anyone who wants a clean, high-impact resume without writing any code. Just enter your details and let ResumeForge handle the typography.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-muted-foreground pt-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <span>7 simple steps covering Personal Info, Education, Skills, Experience, Projects, and Achievements.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <span>Automatic single-page layout optimization and clean typography spacing.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <span>Live instant preview as you fill out each section of your career profile.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <span>One-click &quot;Open in Maker&quot; button if you ever want to fine-tune the code later.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/login?redirect=/generator">
                  <Button variant="outline" className="w-full text-xs font-semibold h-9 border-border">
                    Sign In to Use Resume Generator
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Humanized Benefits Section */}
      <section id="benefits" className="py-20 px-6 lg:px-12 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Why Job Seekers Love ResumeForge</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Everything you need to create clean, job-ready resumes that pass applicant tracking systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 bg-card border-border shadow-sm rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground">
              <FileCheck className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-semibold text-sm">ATS-Approved Formatting</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standard fonts, clean hierarchy, and standard headings ensure your resume parses accurately in every recruiter software.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-card border-border shadow-sm rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground">
              <Download className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-semibold text-sm">Instant PDF & Source Export</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download clean, high-resolution vector PDFs in seconds or export the full LaTeX source code to take with you anywhere.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-card border-border shadow-sm rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-semibold text-sm">Private & Account Protected</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your resume data is stored securely in your private account workspace. No third-party tracking, no watermarks, and no hidden fees.
            </p>
          </Card>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-muted/30 border-t border-border px-6 lg:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to craft your next resume?</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Create an account in less than a minute and start building your resume today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="h-10 px-6 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-10 px-6 text-xs font-medium border-border">
                Sign In
              </Button>
            </Link>
          </div>
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
            <span>— Precision Resume Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login?redirect=/maker" className="hover:text-foreground transition-colors">Resume Maker</Link>
            <Link href="/login?redirect=/generator" className="hover:text-foreground transition-colors">Resume Generator</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
