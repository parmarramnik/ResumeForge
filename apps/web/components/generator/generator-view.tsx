'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  FileCode,
  Save,
  Check,
  RotateCw,
  Code2,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Trophy,
  User,
  GripVertical,
  CheckCircle2,
} from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
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
  { id: 'personal', label: '1. Personal', icon: User },
  { id: 'education', label: '2. Education', icon: GraduationCap },
  { id: 'skills', label: '3. Skills & Coursework', icon: Wrench },
  { id: 'experience', label: '4. Experience', icon: Briefcase },
  { id: 'coding_profiles', label: '5. Coding Profiles', icon: Code2 },
  { id: 'projects', label: '6. Projects', icon: FolderGit2 },
  { id: 'achievements', label: '7. Achievements', icon: Trophy },
];

export function GeneratorView() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [templates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [resumeTitle, setResumeTitle] = useState<string>('Software Engineer Resume — Arjun Mehta');
  const [generatedTex, setGeneratedTex] = useState<string>('');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const abortControllerRef = useRef<AbortController | null>(null);
  const localBlobCacheRef = useRef<Map<string, Blob>>(new Map());

  // React Hook Form initialization
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormDataSchema),
    defaultValues: SAMPLE_RESUME_FORM_DATA,
    mode: 'onBlur',
  });

  const { register, control, getValues, formState: { errors } } = form;

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

  const { fields: codingFields, append: appendCoding, remove: removeCoding } = useFieldArray({
    control,
    name: 'coding_profiles',
  });

  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({
    control,
    name: 'projects',
  });

  const { fields: achFields, append: appendAch, remove: removeAch } = useFieldArray({
    control,
    name: 'achievements',
  });

  // Fast Compile helper with AbortController & Client-side Memory Cache
  const triggerCompile = useCallback(async (texSource: string) => {
    if (!texSource) return;

    // Check instant client cache
    const cachedBlob = localBlobCacheRef.current.get(texSource);
    if (cachedBlob) {
      setPdfBlob(cachedBlob);
      setCompileError(null);
      return;
    }

    // Cancel previous in-flight compile immediately
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsCompiling(true);
    setCompileError(null);

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tex: texSource, engine: 'pdflatex' }),
        signal: controller.signal,
      });

      if (res.ok) {
        const blob = await res.blob();
        localBlobCacheRef.current.set(texSource, blob);
        setPdfBlob(blob);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setCompileError(errJson.error || 'Failed to compile resume.');
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setCompileError('Unable to connect to compilation backend.');
    } finally {
      setIsCompiling(false);
    }
  }, []);

  const compileFromValues = useCallback((values: ResumeFormData) => {
    try {
      const template = templates[0] || INITIAL_TEMPLATES[0];
      const tex = renderTemplate(template.tex_template || MASTER_LATEX_TEMPLATE, values as unknown as Record<string, unknown>);
      setGeneratedTex(tex);
      triggerCompile(tex);
    } catch (e: unknown) {
      setCompileError(e instanceof Error ? e.message : 'Error generating template');
    }
  }, [templates, triggerCompile]);

  const handleUpdatePreview = useCallback(() => {
    const values = getValues();
    compileFromValues(values);
  }, [getValues, compileFromValues]);

  // Initial mount compilation
  useEffect(() => {
    handleUpdatePreview();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
  };

  // "Edit LaTeX in Maker"
  const handleEditInMaker = () => {
    try {
      const template = templates[0] || INITIAL_TEMPLATES[0];
      const values = getValues();
      const tex = renderTemplate(template.tex_template || MASTER_LATEX_TEMPLATE, values as unknown as Record<string, unknown>);
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
      const values = getValues();
      await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resumeTitle,
          service_type: 'generator',
          template_id: templates[0]?.id,
          form_data: values,
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
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Top Header Controls */}
      <div className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Input
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="h-8 w-72 text-xs font-semibold bg-transparent border-transparent hover:border-border focus:border-border px-2"
          />
          <Badge variant="outline" className="text-[10px] uppercase font-mono text-muted-foreground border-border">
            ATS Master Template
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditInMaker}
            className="h-8 text-xs gap-1.5 font-medium"
            title="Open generated LaTeX code in Maker IDE"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Edit in Maker IDE</span>
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
                <Check className="w-3.5 h-3.5 text-foreground" />
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
            className="h-8 text-xs gap-1.5 font-semibold bg-foreground text-background hover:bg-foreground/90"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
            <span>Update Preview</span>
          </Button>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="h-11 border-b border-border bg-muted/30 px-6 flex items-center gap-1 overflow-x-auto shrink-0">
        {WIZARD_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => handleStepChange(idx)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                currentStep === idx
                  ? 'bg-foreground text-background font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <StepIcon className="w-3.5 h-3.5" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Split Body with Overleaf-Style Resizer */}
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Left Side: Step Form Controls */}
        <Panel defaultSize={50} minSize={25} className="flex flex-col overflow-hidden bg-card">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STEP 0: Personal Information */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Personal Information</h3>
                  <p className="text-xs text-muted-foreground">Header contact details, location, and verified links</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-xs font-medium">Full Name *</Label>
                    <Input {...register('personal.name')} placeholder="Arjun Mehta" className="text-xs h-8" />
                    {errors.personal?.name && <p className="text-[11px] text-destructive">{errors.personal.name.message}</p>}
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-xs font-medium">Email Address *</Label>
                    <Input {...register('personal.email')} placeholder="arjun.mehta.dev@example.com" className="text-xs h-8" />
                    {errors.personal?.email && <p className="text-[11px] text-destructive">{errors.personal.email.message}</p>}
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-xs font-medium">Phone Number</Label>
                    <Input {...register('personal.phone')} placeholder="+91 9876543210" className="text-xs h-8" />
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-xs font-medium">Location</Label>
                    <Input {...register('personal.location')} placeholder="Ahmedabad, Gujarat" className="text-xs h-8" />
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-xs font-medium">LinkedIn URL</Label>
                    <Input {...register('personal.linkedin')} placeholder="https://www.linkedin.com/in/arjun-mehta-dev/" className="text-xs h-8" />
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-xs font-medium">GitHub URL</Label>
                    <Input {...register('personal.github')} placeholder="https://github.com/arjunmehta-dev" className="text-xs h-8" />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs font-medium">Portfolio / Website URL</Label>
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
                    <h3 className="text-sm font-semibold">Education</h3>
                    <p className="text-xs text-muted-foreground">Institutions, degrees, GPAs, and timelines</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendEdu({
                        institution: '',
                        degree: '',
                        field: '',
                        gpa: '',
                        start_date: '',
                        end_date: '',
                        location: '',
                      })
                    }
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Education
                  </Button>
                </div>

                <div className="space-y-3">
                  {eduFields.map((field, idx) => (
                    <Card key={field.id} className="p-4 border-border space-y-3 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Entry #{idx + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEdu(idx)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Institution & Location *</Label>
                          <Input
                            {...register(`education.${idx}.institution`)}
                            placeholder="Western Institute of Technology, Ahmedabad-Gujarat"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Degree / Board *</Label>
                          <Input
                            {...register(`education.${idx}.degree`)}
                            placeholder="B.Tech. or 12th Board"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Field of Study / Board Name</Label>
                          <Input
                            {...register(`education.${idx}.field`)}
                            placeholder="Computer Science & Engineering"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">CGPA / Percentile</Label>
                          <Input
                            {...register(`education.${idx}.gpa`)}
                            placeholder="CGPA: 8.6/10 or 98.72 percentile"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Start Date</Label>
                          <Input
                            {...register(`education.${idx}.start_date`)}
                            placeholder="July 2023"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">End Date</Label>
                          <Input
                            {...register(`education.${idx}.end_date`)}
                            placeholder="May 2027"
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Technical Skills & Coursework */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Technical Skills & Coursework</h3>
                    <p className="text-xs text-muted-foreground">Categorized skills (Languages, Databases, Tools, Concepts)</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => appendSkill({ category: '', skills: '' })}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Category
                  </Button>
                </div>

                <div className="space-y-3">
                  {skillFields.map((field, idx) => (
                    <Card key={field.id} className="p-4 border-border space-y-3 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Skill Category #{idx + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSkill(idx)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-3 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Category Name *</Label>
                          <Input
                            {...register(`skills.${idx}.category`)}
                            placeholder="Languages, Databases, etc."
                            className="text-xs h-8 font-medium"
                          />
                        </div>

                        <div className="col-span-3 sm:col-span-2 space-y-1">
                          <Label className="text-[11px]">Skills (Comma-separated) *</Label>
                          <Input
                            {...register(`skills.${idx}.skills`)}
                            placeholder="C++, Python, React, PostgreSQL, Docker"
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Experience */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Work Experience</h3>
                    <p className="text-xs text-muted-foreground">Internships, roles, tech stacks, and bullet accomplishments</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendExp({
                        company: '',
                        role: '',
                        location: '',
                        technologies: '',
                        start_date: '',
                        end_date: '',
                        current: false,
                        bullets: [''],
                      })
                    }
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Experience
                  </Button>
                </div>

                <div className="space-y-4">
                  {expFields.map((field, idx) => (
                    <Card key={field.id} className="p-4 border-border space-y-3 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Experience #{idx + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExp(idx)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Company Name *</Label>
                          <Input
                            {...register(`experience.${idx}.company`)}
                            placeholder="NovaStack Technologies"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Location</Label>
                          <Input
                            {...register(`experience.${idx}.location`)}
                            placeholder="Vadodara, Gujarat"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Role / Position *</Label>
                          <Input
                            {...register(`experience.${idx}.role`)}
                            placeholder="Software Engineer Intern"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Technologies Used</Label>
                          <Input
                            {...register(`experience.${idx}.technologies`)}
                            placeholder="React, FastAPI, PostgreSQL"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Start Date</Label>
                          <Input
                            {...register(`experience.${idx}.start_date`)}
                            placeholder="May 2026"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">End Date</Label>
                          <Input
                            {...register(`experience.${idx}.end_date`)}
                            placeholder="Jul 2026 or Present"
                            className="text-xs h-8"
                          />
                        </div>
                      </div>

                      {/* Bullets */}
                      <div className="space-y-1.5 pt-2 border-t border-border/50">
                        <Label className="text-[11px] font-semibold">Bullet Accomplishments (1 per line)</Label>
                        <textarea
                          rows={3}
                          defaultValue={field.bullets?.join('\n') || ''}
                          onBlur={(e) => {
                            const lines = e.target.value.split('\n').filter((l) => l.trim().length > 0);
                            form.setValue(`experience.${idx}.bullets`, lines);
                          }}
                          placeholder="Developed REST APIs and secured application services using JWT and RBAC..."
                          className="w-full text-xs p-2 rounded-md bg-background border border-border focus:border-foreground outline-none font-mono"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Coding Profiles */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Coding Profiles</h3>
                    <p className="text-xs text-muted-foreground">LeetCode, Codeforces, HackerRank profile URLs and problem stats</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => appendCoding({ platform: '', url: '', description: '' })}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Profile
                  </Button>
                </div>

                <div className="space-y-3">
                  {codingFields.map((field, idx) => (
                    <Card key={field.id} className="p-4 border-border space-y-3 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Profile #{idx + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCoding(idx)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Delete profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-3 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Platform *</Label>
                          <Input
                            {...register(`coding_profiles.${idx}.platform`)}
                            placeholder="LeetCode, Codeforces"
                            className="text-xs h-8 font-medium"
                          />
                        </div>

                        <div className="col-span-3 sm:col-span-2 space-y-1">
                          <Label className="text-[11px]">Profile URL *</Label>
                          <Input
                            {...register(`coding_profiles.${idx}.url`)}
                            placeholder="https://leetcode.com/u/your_handle/"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-3 space-y-1">
                          <Label className="text-[11px]">Description / Stats</Label>
                          <Input
                            {...register(`coding_profiles.${idx}.description`)}
                            placeholder="Solved 275+ algorithmic problems"
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: Projects */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Technical Projects</h3>
                    <p className="text-xs text-muted-foreground">Key software engineering projects, tech stack, and links</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendProj({
                        name: '',
                        technologies: '',
                        github: '',
                        live_url: '',
                        bullets: [''],
                      })
                    }
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Project
                  </Button>
                </div>

                <div className="space-y-4">
                  {projFields.map((field, idx) => (
                    <Card key={field.id} className="p-4 border-border space-y-3 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Project #{idx + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProj(idx)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Project Title *</Label>
                          <Input
                            {...register(`projects.${idx}.name`)}
                            placeholder="StudySphere - Collaborative Learning Platform"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Technologies Used</Label>
                          <Input
                            {...register(`projects.${idx}.technologies`)}
                            placeholder="FastAPI, React, PostgreSQL, Docker"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">GitHub URL</Label>
                          <Input
                            {...register(`projects.${idx}.github`)}
                            placeholder="https://github.com/username/project"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Live Demo URL</Label>
                          <Input
                            {...register(`projects.${idx}.live_url`)}
                            placeholder="https://project-demo.com"
                            className="text-xs h-8"
                          />
                        </div>
                      </div>

                      {/* Bullets */}
                      <div className="space-y-1.5 pt-2 border-t border-border/50">
                        <Label className="text-[11px] font-semibold">Bullet Points (1 per line)</Label>
                        <textarea
                          rows={3}
                          defaultValue={field.bullets?.join('\n') || ''}
                          onBlur={(e) => {
                            const lines = e.target.value.split('\n').filter((l) => l.trim().length > 0);
                            form.setValue(`projects.${idx}.bullets`, lines);
                          }}
                          placeholder="Built a full-stack learning platform featuring structured study modules..."
                          className="w-full text-xs p-2 rounded-md bg-background border border-border focus:border-foreground outline-none font-mono"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Achievements */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Achievements & Honors</h3>
                    <p className="text-xs text-muted-foreground">Hackathon wins, competitive rankings, and certificate links</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => appendAch({ title: '', description: '', url: '' })}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Achievement
                  </Button>
                </div>

                <div className="space-y-3">
                  {achFields.map((field, idx) => (
                    <Card key={field.id} className="p-4 border-border space-y-3 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Achievement #{idx + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAch(idx)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          title="Delete achievement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-3 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Title / Rank *</Label>
                          <Input
                            {...register(`achievements.${idx}.title`)}
                            placeholder="Winner of National Challenge 2026"
                            className="text-xs h-8 font-medium"
                          />
                        </div>

                        <div className="col-span-3 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Track / Description</Label>
                          <Input
                            {...register(`achievements.${idx}.description`)}
                            placeholder="FinTech Automation Track"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="col-span-3 sm:col-span-1 space-y-1">
                          <Label className="text-[11px]">Certificate / Verification Link</Label>
                          <Input
                            {...register(`achievements.${idx}.url`)}
                            placeholder="https://example.com/certificate"
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
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
                  onClick={() => handleStepChange(Math.min(WIZARD_STEPS.length - 1, currentStep + 1))}
                  className="text-xs gap-1 bg-foreground text-background hover:bg-foreground/90 font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleUpdatePreview}
                  className="text-xs gap-1.5 font-semibold bg-foreground text-background hover:bg-foreground/90"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Finish & Preview
                </Button>
              )}
            </div>
          </div>
        </Panel>

        {/* Overleaf-Style Draggable Splitter Handle */}
        <PanelResizeHandle className="w-2 relative bg-border/70 hover:bg-foreground/30 transition-colors cursor-col-resize flex items-center justify-center group z-20 select-none">
          <div className="w-1 h-8 rounded-full bg-muted-foreground/40 group-hover:bg-foreground transition-colors flex items-center justify-center">
            <GripVertical className="w-3 h-3 text-muted-foreground/70 group-hover:text-background transition-colors" />
          </div>
        </PanelResizeHandle>

        {/* Right Side: High Performance PDF Viewer */}
        <Panel defaultSize={50} minSize={25} className="flex flex-col bg-muted/20 overflow-hidden">
          <ResumePdfViewer
            pdfBlob={pdfBlob}
            isLoading={isCompiling}
            errorMessage={compileError}
            onRetry={handleUpdatePreview}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
