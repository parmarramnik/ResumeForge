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
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResumePdfViewer } from '@/components/pdf/resume-pdf-viewer';
import { resumeFormDataSchema } from '@resumeforge/validation';
import { ResumeFormData, Template } from '@resumeforge/shared-types';
import { INITIAL_TEMPLATES, SAMPLE_RESUME_FORM_DATA, MASTER_LATEX_TEMPLATE } from '@/lib/supabase/mock-data';
import { renderTemplate } from '@resumeforge/template-engine';

const WIZARD_STEPS = [
  { id: 'personal', label: '1. Personal' },
  { id: 'education', label: '2. Education' },
  { id: 'skills', label: '3. Skills & Coursework' },
  { id: 'experience', label: '4. Experience' },
  { id: 'projects', label: '5. Projects' },
  { id: 'achievements', label: '6. Achievements' },
];

export function GeneratorView() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [resumeTitle, setResumeTitle] = useState<string>('Software Engineer Resume — Arjun Mehta');
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

  // Field Arrays
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: 'education',
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills',
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: 'experience',
  });

  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({
    control,
    name: 'projects',
  });

  const { fields: achFields, append: appendAch, remove: removeAch } = useFieldArray({
    control,
    name: 'achievements',
  });

  // Compile helper
  const triggerCompile = useCallback(async (texSource: string) => {
    if (!texSource) return;
    setIsCompiling(true);
    setCompileError(null);

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tex: texSource }),
      });

      if (res.ok) {
        const blob = await res.blob();
        setPdfBlob(blob);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setCompileError(errJson.error || 'Failed to compile resume.');
      }
    } catch {
      setCompileError('Unable to connect to compilation backend.');
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Live generation when form values change
  const currentValues = watch();

  const handleUpdatePreview = useCallback(() => {
    try {
      const template = templates[0] || INITIAL_TEMPLATES[0];
      const tex = renderTemplate(template.tex_template || MASTER_LATEX_TEMPLATE, currentValues as unknown as Record<string, unknown>);
      setGeneratedTex(tex);
      triggerCompile(tex);
    } catch (e: any) {
      setCompileError(e?.message || 'Error generating template');
    }
  }, [currentValues, templates, triggerCompile]);

  useEffect(() => {
    handleUpdatePreview();
  }, []); // Run on initial mount

  // "Edit LaTeX in Maker"
  const handleEditInMaker = () => {
    try {
      const template = templates[0] || INITIAL_TEMPLATES[0];
      const tex = renderTemplate(template.tex_template || MASTER_LATEX_TEMPLATE, currentValues as unknown as Record<string, unknown>);
      localStorage.setItem('resumeforge_maker_tex', tex);
      router.push('/maker');
    } catch {
      router.push('/maker');
    }
  };

  // Save Resume
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resumeTitle,
          service_type: 'generator',
          template_id: templates[0]?.id,
          form_data: currentValues,
          raw_tex: generatedTex,
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

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Action Bar */}
      <div className="h-14 border-b border-border bg-card/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <Input
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="h-8 w-72 text-xs font-semibold bg-transparent border-transparent hover:border-border focus:border-border px-2"
          />
          <Badge variant="outline" className="text-[10px] uppercase font-mono text-muted-foreground">
            Single-Page ATS Master
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditInMaker}
            className="h-8 text-xs gap-1.5"
            title="Open generated LaTeX code in Maker IDE"
          >
            <FileCode className="w-3.5 h-3.5 text-primary" />
            <span>Edit LaTeX in Maker</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs gap-1.5 font-medium"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleUpdatePreview}
            disabled={isCompiling}
            className="h-8 text-xs gap-1.5 shadow-sm font-medium"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
            <span>Update Preview</span>
          </Button>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="h-11 border-b border-border bg-muted/20 px-6 flex items-center gap-1 overflow-x-auto shrink-0">
        {WIZARD_STEPS.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(idx)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              currentStep === idx
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Step Form Controls */}
        <div className="w-1/2 border-r border-border overflow-y-auto p-6 space-y-6">
          {/* STEP 0: Personal Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Personal Information</h3>
                <p className="text-xs text-muted-foreground">Contact header details and social links</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-xs">Full Name *</Label>
                  <Input {...register('personal.name')} placeholder="Arjun Mehta" className="text-xs h-8" />
                  {errors.personal?.name && <p className="text-[11px] text-destructive">{errors.personal.name.message}</p>}
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-xs">Email Address *</Label>
                  <Input {...register('personal.email')} placeholder="arjun.mehta.dev@example.com" className="text-xs h-8" />
                  {errors.personal?.email && <p className="text-[11px] text-destructive">{errors.personal.email.message}</p>}
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-xs">Phone Number</Label>
                  <Input {...register('personal.phone')} placeholder="+91 9876543210" className="text-xs h-8" />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-xs">Location</Label>
                  <Input {...register('personal.location')} placeholder="Ahmedabad, Gujarat" className="text-xs h-8" />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-xs">LinkedIn URL</Label>
                  <Input {...register('personal.linkedin')} placeholder="https://linkedin.com/in/..." className="text-xs h-8" />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-xs">GitHub URL</Label>
                  <Input {...register('personal.github')} placeholder="https://github.com/..." className="text-xs h-8" />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Portfolio URL</Label>
                  <Input {...register('personal.portfolio')} placeholder="https://arjunmehta.dev/" className="text-xs h-8" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Education */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Education</h3>
                  <p className="text-xs text-muted-foreground">Degrees, institutions, percentiles, and timelines</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => appendEdu({ institution: '', degree: '', field: '', gpa: '', start_date: '', end_date: '', location: '' })}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Education
                </Button>
              </div>

              {eduFields.map((field, idx) => (
                <Card key={field.id} className="border-border">
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/50">
                    <CardTitle className="text-xs font-semibold">Education #{idx + 1}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => removeEdu(idx)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2">
                        <Label className="text-[11px]">Institution & Location</Label>
                        <Input {...register(`education.${idx}.institution`)} placeholder="Western Institute of Technology, Ahmedabad-Gujarat" className="text-xs h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Degree</Label>
                        <Input {...register(`education.${idx}.degree`)} placeholder="B.Tech." className="text-xs h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Field / Board</Label>
                        <Input {...register(`education.${idx}.field`)} placeholder="Computer Science & Engineering" className="text-xs h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">CGPA / Percentile</Label>
                        <Input {...register(`education.${idx}.gpa`)} placeholder="CGPA: 8.6/10" className="text-xs h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Timeline</Label>
                        <div className="flex gap-2">
                          <Input {...register(`education.${idx}.start_date`)} placeholder="July 2023" className="text-xs h-8" />
                          <Input {...register(`education.${idx}.end_date`)} placeholder="May 2027" className="text-xs h-8" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* STEP 2: Technical Skills & Coursework */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Technical Skills & Coursework</h3>
                  <p className="text-xs text-muted-foreground">Categorized skills list for clean ATS typesetting</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => appendSkill({ category: '', skills: '' })}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Category
                </Button>
              </div>

              {skillFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-start border border-border/60 p-3 rounded-lg bg-card/40">
                  <div className="w-1/3 space-y-1">
                    <Label className="text-[11px]">Category</Label>
                    <Input {...register(`skills.${idx}.category`)} placeholder="Languages" className="text-xs h-8" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">Skills (Comma Separated)</Label>
                    <Input {...register(`skills.${idx}.skills`)} placeholder="C++, Python, JavaScript, SQL" className="text-xs h-8" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSkill(idx)} className="h-8 w-8 mt-5 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: Experience */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Work Experience</h3>
                  <p className="text-xs text-muted-foreground">Internships, software roles, and accomplishments</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => appendExp({ company: '', role: '', location: '', technologies: '', start_date: '', end_date: '', current: false, bullets: [''] })}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Experience
                </Button>
              </div>

              {expFields.map((field, idx) => (
                <Card key={field.id} className="border-border">
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/50">
                    <CardTitle className="text-xs font-semibold">Experience #{idx + 1}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => removeExp(idx)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Company</Label>
                        <Input {...register(`experience.${idx}.company`)} placeholder="NovaStack Technologies" className="text-xs h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Location</Label>
                        <Input {...register(`experience.${idx}.location`)} placeholder="Vadodara, Gujarat" className="text-xs h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Role / Title</Label>
                        <Input {...register(`experience.${idx}.role`)} placeholder="Software Engineer Intern" className="text-xs h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Technologies Used</Label>
                        <Input {...register(`experience.${idx}.technologies`)} placeholder="React, FastAPI, PostgreSQL" className="text-xs h-8" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-[11px]">Timeline</Label>
                        <div className="flex gap-2">
                          <Input {...register(`experience.${idx}.start_date`)} placeholder="May 2026" className="text-xs h-8" />
                          <Input {...register(`experience.${idx}.end_date`)} placeholder="Jul 2026" className="text-xs h-8" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* STEP 4: Projects */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Projects</h3>
                  <p className="text-xs text-muted-foreground">Technical systems, GitHub repositories, and live links</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => appendProj({ name: '', technologies: '', github: '', live_url: '', bullets: [''] })}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Project
                </Button>
              </div>

              {projFields.map((field, idx) => (
                <Card key={field.id} className="border-border">
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/50">
                    <CardTitle className="text-xs font-semibold">Project #{idx + 1}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => removeProj(idx)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2">
                        <Label className="text-[11px]">Project Name</Label>
                        <Input {...register(`projects.${idx}.name`)} placeholder="StudySphere - AI Learning Platform" className="text-xs h-8" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-[11px]">Tech Stack</Label>
                        <Input {...register(`projects.${idx}.technologies`)} placeholder="FastAPI, React, PostgreSQL, OpenAI API" className="text-xs h-8" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-[11px]">GitHub URL</Label>
                        <Input {...register(`projects.${idx}.github`)} placeholder="https://github.com/..." className="text-xs h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* STEP 5: Achievements */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Achievements & Honors</h3>
                  <p className="text-xs text-muted-foreground">Hackathon wins, rankings, and certificate links</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => appendAch({ title: '', description: '', url: '' })}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Achievement
                </Button>
              </div>

              {achFields.map((field, idx) => (
                <div key={field.id} className="border border-border/60 p-3 rounded-lg space-y-2 bg-card/40">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold">Achievement #{idx + 1}</Label>
                    <Button variant="ghost" size="icon" onClick={() => removeAch(idx)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input {...register(`achievements.${idx}.title`)} placeholder="Winner of National Student Innovation Challenge 2026" className="text-xs h-8" />
                    <Input {...register(`achievements.${idx}.description`)} placeholder="FinTech Automation Track" className="text-xs h-8" />
                    <Input {...register(`achievements.${idx}.url`)} placeholder="https://example.com/certificates/fintech-2026" className="text-xs h-8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="text-xs gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <span className="text-xs text-muted-foreground font-mono">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>

            {currentStep < WIZARD_STEPS.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentStep((prev) => Math.min(WIZARD_STEPS.length - 1, prev + 1))}
                className="text-xs gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleUpdatePreview}
                className="text-xs gap-1.5 font-semibold bg-primary text-primary-foreground shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Finish & Preview
              </Button>
            )}
          </div>
        </div>

        {/* Right Side: High Performance PDF Viewer */}
        <div className="w-1/2 bg-muted/30 overflow-hidden flex flex-col">
          <ResumePdfViewer
            pdfBlob={pdfBlob}
            isLoading={isCompiling}
            errorMessage={compileError}
            onRetry={handleUpdatePreview}
          />
        </div>
      </div>
    </div>
  );
}
