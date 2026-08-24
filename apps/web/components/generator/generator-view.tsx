'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  FileCode,
  Save,
  Check,
  RotateCw,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResumePdfViewer } from '@/components/pdf/resume-pdf-viewer';
import { resumeFormDataSchema } from '@resumeforge/validation';
import { ResumeFormData, Template } from '@resumeforge/shared-types';
import { INITIAL_TEMPLATES, SAMPLE_RESUME_FORM_DATA } from '@/lib/supabase/mock-data';
import { renderTemplate } from '@resumeforge/template-engine';

const WIZARD_STEPS = [
  { id: 'template', label: 'Template' },
  { id: 'personal', label: 'Personal' },
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'extras', label: 'Certifications' },
];

export function GeneratorView() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(INITIAL_TEMPLATES[0].id);
  const [resumeTitle, setResumeTitle] = useState<string>('My Professional Resume');
  const [generatedTex, setGeneratedTex] = useState<string>('');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // React Hook Form initialization
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormDataSchema),
    defaultValues: SAMPLE_RESUME_FORM_DATA,
    mode: 'onChange',
  });

  const { register, control, watch, handleSubmit, formState: { errors } } = form;

  // Field Arrays for repeatable sections
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: 'experience',
  });

  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({
    control,
    name: 'projects',
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: 'education',
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills',
  });

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control,
    name: 'certifications',
  });

  // Fetch templates from API
  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length > 0) {
          setTemplates(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Compile generated LaTeX
  const handleGenerateAndCompile = useCallback(async () => {
    if (!currentTemplate) return;
    setIsCompiling(true);
    setCompileError(null);

    const formData = form.getValues();
    // Render LaTeX using template engine and escaping
    const tex = renderTemplate(currentTemplate.tex_template, formData as unknown as Record<string, unknown>);
    setGeneratedTex(tex);

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tex, engine: 'tectonic' }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        setCompileError(errorJson.error || 'Compilation failed');
        return;
      }

      const blob = await res.blob();
      setPdfBlob(blob);
    } catch (err: unknown) {
      setCompileError(err instanceof Error ? err.message : 'Compilation connection error');
    } finally {
      setIsCompiling(false);
    }
  }, [currentTemplate, form]);

  // Initial compilation on mount
  useEffect(() => {
    handleGenerateAndCompile();
  }, [selectedTemplateId]);

  // Save Resume
  const handleSave = async () => {
    setIsSaving(true);
    const formData = form.getValues();
    const tex = renderTemplate(currentTemplate.tex_template, formData as unknown as Record<string, unknown>);

    try {
      await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resumeTitle,
          service_type: 'generator',
          template_id: selectedTemplateId,
          form_data: formData,
          raw_tex: tex,
        }),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Open in Maker snapshot (Rule #27)
  const handleOpenInMaker = () => {
    const formData = form.getValues();
    const tex = renderTemplate(currentTemplate.tex_template, formData as unknown as Record<string, unknown>);

    // Store in localStorage / session for Maker consumption
    localStorage.setItem('resumeforge_maker_snapshot', tex);
    localStorage.setItem('resumeforge_maker_snapshot_title', `${resumeTitle} (from Generator)`);
    router.push('/maker');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-6 md:-m-8">
      {/* Top Toolbar */}
      <div className="h-13 bg-card border-b border-border px-4 py-2 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0 max-w-sm">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <Input
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="h-8 text-xs font-medium bg-transparent border-transparent hover:border-border focus:border-input focus:bg-background transition-colors truncate"
            placeholder="My Professional Resume"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInMaker}
            className="h-8 text-xs gap-1.5 font-medium"
            title="Export snapshot to Resume Maker LaTeX IDE"
          >
            <FileCode className="w-3.5 h-3.5 text-primary" />
            <span>Edit LaTeX in Maker</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs gap-1.5"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleGenerateAndCompile}
            disabled={isCompiling}
            className="h-8 text-xs gap-1.5 shadow-sm font-semibold"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
            <span>Update Preview</span>
          </Button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden bg-background">
        {/* Left Form Wizard (7 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col h-full border-r border-border overflow-hidden">
          {/* Step Navigation Tabs */}
          <div className="flex items-center overflow-x-auto border-b border-border bg-muted/20 px-3 py-1.5 gap-1 shrink-0 text-xs select-none">
            {WIZARD_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  currentStep === idx
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="text-[10px] opacity-75 font-mono">{idx + 1}.</span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>

          {/* Step Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STEP 0: TEMPLATE SELECTION */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold">Choose an ATS-Approved Template</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Templates are designed and validated by administrators to ensure optimal typesetting and parsing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {templates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`relative border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                        selectedTemplateId === tmpl.id
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                          : 'border-border hover:border-foreground/30 bg-card'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {tmpl.category || 'Standard'}
                          </Badge>
                          {selectedTemplateId === tmpl.id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <h4 className="font-semibold text-sm">{tmpl.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {tmpl.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1: PERSONAL INFO */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold">Personal Information</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Essential contact information and online links.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full Name *</Label>
                    <Input {...register('personal.name')} placeholder="e.g. Alex Mercer" />
                    {errors.personal?.name && (
                      <p className="text-[11px] text-destructive">{errors.personal.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Email Address *</Label>
                    <Input {...register('personal.email')} type="email" placeholder="e.g. alex@example.com" />
                    {errors.personal?.email && (
                      <p className="text-[11px] text-destructive">{errors.personal.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <Input {...register('personal.phone')} placeholder="e.g. +1 (555) 019-2834" />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input {...register('personal.location')} placeholder="e.g. San Francisco, CA" />
                  </div>

                  <div className="space-y-1.5">
                    <Label>LinkedIn URL</Label>
                    <Input {...register('personal.linkedin')} placeholder="https://linkedin.com/in/..." />
                  </div>

                  <div className="space-y-1.5">
                    <Label>GitHub Username or URL</Label>
                    <Input {...register('personal.github')} placeholder="e.g. alexmercer-dev" />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Portfolio / Personal Website</Label>
                    <Input {...register('personal.portfolio')} placeholder="https://alexmercer.dev" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SUMMARY */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold">Professional Summary</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Concise 2-3 sentence overview highlighting your core expertise, years of experience, and key accomplishments.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Summary Text</Label>
                  <Textarea
                    {...register('summary')}
                    rows={6}
                    placeholder="Senior Software Engineer with 6+ years of experience building resilient cloud systems..."
                  />
                </div>
              </div>
            )}

            {/* STEP 3: EXPERIENCE */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Work Experience</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add your professional employment history in reverse chronological order.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendExp({
                        company: '',
                        role: '',
                        location: '',
                        start_date: '',
                        end_date: '',
                        current: false,
                        description: '',
                        bullets: [''],
                      })
                    }
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Position
                  </Button>
                </div>

                <div className="space-y-4">
                  {expFields.map((field, idx) => (
                    <Card key={field.id} className="border-border">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-semibold">
                          Position #{idx + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExp(idx)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Company *</Label>
                            <Input {...register(`experience.${idx}.company` as const)} placeholder="e.g. Apex Systems" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Role *</Label>
                            <Input {...register(`experience.${idx}.role` as const)} placeholder="e.g. Staff Engineer" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Start Date</Label>
                            <Input {...register(`experience.${idx}.start_date` as const)} placeholder="e.g. Jan 2022" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">End Date</Label>
                            <Input {...register(`experience.${idx}.end_date` as const)} placeholder="e.g. Present" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Location</Label>
                          <Input {...register(`experience.${idx}.location` as const)} placeholder="e.g. San Francisco, CA" />
                        </div>

                        {/* Bullet Points */}
                        <div className="space-y-2 pt-2">
                          <Label className="text-xs">Impact Bullet Points</Label>
                          {form.watch(`experience.${idx}.bullets`)?.map((_, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2">
                              <Input
                                {...register(`experience.${idx}.bullets.${bIdx}` as const)}
                                placeholder="e.g. Architected microservices reducing P99 latency by 35%..."
                                className="text-xs"
                              />
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const curr = form.getValues(`experience.${idx}.bullets`) || [];
                              form.setValue(`experience.${idx}.bullets`, [...curr, '']);
                            }}
                            className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="w-3 h-3" />
                            Add Bullet Point
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: PROJECTS */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Key Projects & Open Source</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Showcase notable technical projects, open-source work, or systems you created.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendProj({
                        name: '',
                        description: '',
                        technologies: '',
                        github: '',
                        live_url: '',
                        bullets: [''],
                      })
                    }
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Project
                  </Button>
                </div>

                <div className="space-y-4">
                  {projFields.map((field, idx) => (
                    <Card key={field.id} className="border-border">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-semibold">Project #{idx + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProj(idx)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Project Name *</Label>
                            <Input {...register(`projects.${idx}.name` as const)} placeholder="e.g. ResilientKV" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Technologies</Label>
                            <Input {...register(`projects.${idx}.technologies` as const)} placeholder="e.g. Go, Raft, Docker" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">GitHub URL</Label>
                            <Input {...register(`projects.${idx}.github` as const)} placeholder="https://github.com/..." />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Live Demo URL</Label>
                            <Input {...register(`projects.${idx}.live_url` as const)} placeholder="https://..." />
                          </div>
                        </div>

                        {/* Bullets */}
                        <div className="space-y-2 pt-2">
                          <Label className="text-xs">Key Highlights</Label>
                          {form.watch(`projects.${idx}.bullets`)?.map((_, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2">
                              <Input
                                {...register(`projects.${idx}.bullets.${bIdx}` as const)}
                                placeholder="e.g. Benchmarked 120k req/s throughput with linearizable reads..."
                                className="text-xs"
                              />
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const curr = form.getValues(`projects.${idx}.bullets`) || [];
                              form.setValue(`projects.${idx}.bullets`, [...curr, '']);
                            }}
                            className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="w-3 h-3" />
                            Add Highlight
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: EDUCATION */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Education</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Degrees, universities, GPAs, and relevant coursework.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendEdu({
                        institution: '',
                        degree: '',
                        field: '',
                        location: '',
                        start_date: '',
                        end_date: '',
                        gpa: '',
                        coursework: '',
                      })
                    }
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Education
                  </Button>
                </div>

                <div className="space-y-4">
                  {eduFields.map((field, idx) => (
                    <Card key={field.id} className="border-border">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-semibold">Institution #{idx + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEdu(idx)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">University / Institution *</Label>
                            <Input {...register(`education.${idx}.institution` as const)} placeholder="e.g. UC Berkeley" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Degree *</Label>
                            <Input {...register(`education.${idx}.degree` as const)} placeholder="e.g. B.S. in Computer Science" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Start Date</Label>
                            <Input {...register(`education.${idx}.start_date` as const)} placeholder="e.g. 2015" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">End Date</Label>
                            <Input {...register(`education.${idx}.end_date` as const)} placeholder="e.g. 2019" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">GPA</Label>
                            <Input {...register(`education.${idx}.gpa` as const)} placeholder="e.g. 3.88" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Location</Label>
                            <Input {...register(`education.${idx}.location` as const)} placeholder="e.g. Berkeley, CA" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Relevant Coursework</Label>
                          <Input {...register(`education.${idx}.coursework` as const)} placeholder="e.g. Distributed Systems, Algorithms" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: SKILLS */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Technical Skills</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Categorize your technical proficiencies (Languages, Frameworks, Cloud, Databases).
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => appendSkill({ category: '', skills: '' })}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Category
                  </Button>
                </div>

                <div className="space-y-3">
                  {skillFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                      <div className="w-1/3 space-y-1">
                        <Label className="text-[11px]">Category</Label>
                        <Input {...register(`skills.${idx}.category` as const)} placeholder="e.g. Languages" className="text-xs" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-[11px]">Skills (comma-separated)</Label>
                        <Input {...register(`skills.${idx}.skills` as const)} placeholder="e.g. TypeScript, Python, Go, SQL" className="text-xs" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(idx)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 mt-5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: CERTIFICATIONS & ACHIEVEMENTS */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold">Certifications & Achievements</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Highlight industry credentials, certifications, and awards.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Certifications</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => appendCert({ name: '', issuer: '', date: '', url: '' })}
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Certification
                    </Button>
                  </div>

                  {certFields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[11px]">Certification Name</Label>
                        <Input {...register(`certifications.${idx}.name` as const)} placeholder="e.g. AWS Solutions Architect" className="text-xs" />
                      </div>
                      <div className="w-1/3 space-y-1">
                        <Label className="text-[11px]">Issuer</Label>
                        <Input {...register(`certifications.${idx}.issuer` as const)} placeholder="e.g. AWS" className="text-xs" />
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-[11px]">Date</Label>
                        <Input {...register(`certifications.${idx}.date` as const)} placeholder="2023" className="text-xs" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCert(idx)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 mt-5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Wizard Bottom Navigation */}
          <div className="h-14 border-t border-border bg-card/80 px-6 flex items-center justify-between shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
              disabled={currentStep === 0}
              className="gap-1.5 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <span className="text-xs text-muted-foreground font-mono">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (currentStep < WIZARD_STEPS.length - 1) {
                  setCurrentStep((prev) => prev + 1);
                } else {
                  handleGenerateAndCompile();
                }
              }}
              className="gap-1.5 text-xs font-medium shadow-sm"
            >
              {currentStep === WIZARD_STEPS.length - 1 ? 'Generate Resume' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Live PDF Viewer (5 cols) */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col h-full overflow-hidden p-2">
          <ResumePdfViewer
            pdfBlob={pdfBlob}
            isCompiling={isCompiling}
            error={compileError}
            onRecompile={handleGenerateAndCompile}
            documentTitle={resumeTitle}
          />
        </div>
      </div>
    </div>
  );
}
