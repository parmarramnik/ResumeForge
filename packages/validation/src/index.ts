import { z } from 'zod';

export const personalInfoSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  custom_links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});

export const educationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  gpa: z.string().optional(),
  coursework: z.string().optional(),
  bullets: z.array(z.string()).optional(),
});

export const experienceItemSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role / Title is required'),
  location: z.string().optional(),
  technologies: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  current: z.boolean().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const codingProfileItemSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, 'Platform name is required'),
  url: z.string().min(1, 'Profile URL is required'),
  description: z.string().optional(),
  solved_count: z.string().optional(),
});

export const projectItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  technologies: z.string().optional(),
  live_url: z.string().optional(),
  github: z.string().optional(),
  bullets: z.array(z.string()).optional(),
});

export const skillCategorySchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, 'Category name is required'),
  skills: z.string().min(1, 'Skills list is required'),
});

export const certificationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  date: z.string().min(1, 'Date is required'),
  url: z.string().optional(),
});

export const achievementItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Achievement title is required'),
  description: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
});

export const resumeFormDataSchema = z.object({
  personal: personalInfoSchema,
  summary: z.string().optional(),
  education: z.array(educationItemSchema).default([]),
  skills: z.array(skillCategorySchema).default([]),
  experience: z.array(experienceItemSchema).default([]),
  coding_profiles: z.array(codingProfileItemSchema).optional().default([]),
  projects: z.array(projectItemSchema).default([]),
  certifications: z.array(certificationItemSchema).optional().default([]),
  achievements: z.array(achievementItemSchema).optional().default([]),
  custom_fields: z.record(z.unknown()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  service_type: z.enum(['maker', 'generator']),
  template_id: z.string().uuid().optional().nullable(),
  form_data: resumeFormDataSchema.optional().nullable(),
  raw_tex: z.string().min(1, 'LaTeX content is required'),
});

export const updateResumeSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  form_data: resumeFormDataSchema.optional().nullable(),
  raw_tex: z.string().optional(),
  template_id: z.string().uuid().optional().nullable(),
});

export const compileRequestSchema = z.object({
  tex: z.string().min(1, 'LaTeX content is required').max(2097152, 'Payload exceeds 2MB limit'),
  engine: z.enum(['pdflatex', 'tectonic', 'xelatex', 'lualatex']).optional().default('pdflatex'),
  return_base64: z.boolean().optional().default(false),
});
