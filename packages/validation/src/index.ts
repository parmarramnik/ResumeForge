import { z } from 'zod';

// ================= AUTH SCHEMAS =================
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

// ================= RESUME FORM SCHEMAS =================
export const personalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30).optional().default(''),
  location: z.string().max(100).optional().default(''),
  linkedin: z.string().max(150).optional().default(''),
  github: z.string().max(150).optional().default(''),
  portfolio: z.string().max(150).optional().default(''),
});

export const educationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required').max(150),
  degree: z.string().min(1, 'Degree is required').max(100),
  field: z.string().max(100).optional().default(''),
  location: z.string().max(100).optional().default(''),
  start_date: z.string().max(50).default(''),
  end_date: z.string().max(50).default(''),
  gpa: z.string().max(20).optional().default(''),
  coursework: z.string().max(300).optional().default(''),
});

export const experienceItemSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company is required').max(150),
  role: z.string().min(1, 'Role is required').max(100),
  location: z.string().max(100).optional().default(''),
  start_date: z.string().max(50).default(''),
  end_date: z.string().max(50).default(''),
  current: z.boolean().optional().default(false),
  description: z.string().max(500).optional().default(''),
  bullets: z.array(z.string()).default([]),
});

export const projectItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required').max(150),
  description: z.string().max(300).optional().default(''),
  technologies: z.string().max(200).optional().default(''),
  github: z.string().max(150).optional().default(''),
  live_url: z.string().max(150).optional().default(''),
  bullets: z.array(z.string()).default([]),
});

export const skillCategorySchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, 'Category name is required').max(80),
  skills: z.string().min(1, 'Skills are required').max(300),
});

export const certificationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Certification name is required').max(150),
  issuer: z.string().min(1, 'Issuer is required').max(150),
  date: z.string().max(50).optional().default(''),
  url: z.string().max(150).optional().default(''),
});

export const achievementItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(300).optional().default(''),
  date: z.string().max(50).optional().default(''),
});

export const resumeFormDataSchema = z.object({
  personal: personalInfoSchema,
  summary: z.string().max(1000).optional().default(''),
  education: z.array(educationItemSchema).default([]),
  experience: z.array(experienceItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  skills: z.array(skillCategorySchema).default([]),
  certifications: z.array(certificationItemSchema).default([]),
  achievements: z.array(achievementItemSchema).default([]),
  custom_fields: z.record(z.unknown()).optional().default({}),
});

// ================= RESUME CREATION & UPDATE SCHEMAS =================
export const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  service_type: z.enum(['maker', 'generator']),
  template_id: z.string().uuid().optional().nullable(),
  raw_tex: z.string().min(1, 'LaTeX content is required'),
  form_data: resumeFormDataSchema.optional().nullable(),
});

export const updateResumeSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  raw_tex: z.string().optional(),
  form_data: resumeFormDataSchema.optional().nullable(),
  template_id: z.string().uuid().optional().nullable(),
});

// ================= TEMPLATE SCHEMAS =================
export const templateSchemaFieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(['text', 'textarea', 'email', 'url', 'array', 'object', 'date']),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    items: z.array(templateSchemaFieldSchema).optional(),
  })
);

export const templateSchemaDefinitionSchema = z.object({
  sections: z.object({
    personal: z.boolean().optional(),
    summary: z.boolean().optional(),
    education: z.boolean().optional(),
    experience: z.boolean().optional(),
    projects: z.boolean().optional(),
    skills: z.boolean().optional(),
    certifications: z.boolean().optional(),
    achievements: z.boolean().optional(),
    custom: z.array(templateSchemaFieldSchema).optional(),
  }),
  supported_fields: z.array(z.string()).optional(),
});

export const templateInputSchema = z.object({
  title: z.string().min(2, 'Title is required').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500),
  category: z.string().max(50).optional().default('General'),
  thumbnail_url: z.string().url().optional().nullable().or(z.literal('')),
  tex_template: z.string().min(20, 'LaTeX template cannot be empty'),
  schema_definition: templateSchemaDefinitionSchema,
  is_active: z.boolean().default(true),
});

// ================= COMPILER SCHEMAS =================
export const compileRequestSchema = z.object({
  tex: z.string().min(10, 'LaTeX document too short').max(2000000, 'LaTeX document exceeds 2MB limit'),
  engine: z.enum(['tectonic', 'pdflatex']).optional().default('tectonic'),
  resume_id: z.string().uuid().optional(),
});
