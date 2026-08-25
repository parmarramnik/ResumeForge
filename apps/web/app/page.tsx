'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCode2,
  Code,
  FileEdit,
  CheckCircle2,
  ArrowRight,
  Download,
  FileCheck,
  Shield,
  HelpCircle,
  ChevronDown,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'What is the difference between Resume Maker and Resume Generator?',
    answer:
      'Resume Maker is a full-featured LaTeX code editor inside Monaco IDE for users who want total control over raw TeX syntax, custom packages, and live PDF compilation. Resume Generator is a guided 7-step form wizard that automatically creates a single-page ATS-ready resume without requiring you to write any code.',
  },
  {
    question: 'Are resumes created on ResumeForge ATS-friendly?',
    answer:
      'Yes. Both the Resume Maker templates and Resume Generator use standard single-column typesetting, standard Unicode headings, and selectable text layers that parse cleanly across all modern Applicant Tracking Systems (ATS).',
  },
  {
    question: 'Can I download the raw LaTeX (.tex) source code as well as the PDF?',
    answer:
      'Yes. In both Resume Maker and Resume Generator, you can download the compiled PDF or export the raw .tex file anytime so you retain full ownership of your documents.',
  },
  {
    question: 'Is ResumeForge free to use?',
    answer:
      'Yes, ResumeForge is completely free. You can create an account, save unlimited resume revisions, and compile as many PDF resumes as you need with zero hidden fees or watermarks.',
  },
  {
    question: 'What LaTeX engines are supported?',
    answer:
      'Our compilation engine supports pdflatex (Overleaf compatible), xelatex, lualatex, and Tectonic with automatic fallback and standard font packages (FontAwesome, Computer Modern, Roboto, TeX Gyre).',
  },
];

export default function LandingPage() {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  // Ask a Question Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryQuestion, setInquiryQuestion] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInquirySuccess(null);
    setInquiryError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          subject: inquiryQuestion || 'Question from ResumeForge User',
          message: inquiryMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit question. Please try again.');
      }

      setInquirySuccess('Your question has been sent successfully! Our team will get back to you at your email.');
      setInquiryName('');
      setInquiryEmail('');
      setInquiryQuestion('');
      setInquiryMessage('');
    } catch (err: unknown) {
      setInquiryError(err instanceof Error ? err.message : 'Failed to send question.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Interactive Questions & Answers (FAQ & Ask a Question) Section */}
      <section id="faq" className="py-20 bg-muted/20 border-t border-border px-6 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help Center & Support</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Find quick answers to common questions about ResumeForge, formatting, and export options.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Accordion Questions */}
            <div className="lg:col-span-7 space-y-3">
              {FAQ_DATA.map((item, index) => {
                const isOpen = openFAQIndex === index;
                return (
                  <Card
                    key={index}
                    className="border-border bg-card shadow-sm rounded-xl transition-all overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm hover:text-foreground transition-colors"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-foreground' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/40 mt-1 pt-3">
                        {item.answer}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Right Column: Workable Ask a Question Form */}
            <div className="lg:col-span-5">
              <Card className="p-6 border-border bg-card shadow-sm rounded-xl space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>Have a Question? Ask Support</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Can&apos;t find what you are looking for? Send us a question and our team will get back to you.
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-3 pt-1">
                  {inquirySuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{inquirySuccess}</span>
                    </div>
                  )}

                  {inquiryError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{inquiryError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Your Name</Label>
                    <Input
                      required
                      placeholder="e.g. Alex Smith"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Your Email</Label>
                    <Input
                      required
                      type="email"
                      placeholder="name@example.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Question / Subject</Label>
                    <Input
                      placeholder="e.g. Adding custom LaTeX packages"
                      value={inquiryQuestion}
                      onChange={(e) => setInquiryQuestion(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Message / Details</Label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe your question in detail..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full text-xs rounded-md border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-xs font-semibold h-8 gap-2 bg-foreground text-background hover:bg-foreground/90 mt-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Question...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Question</span>
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
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
