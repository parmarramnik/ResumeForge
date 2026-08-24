export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export type ServiceType = 'maker' | 'generator';

export interface TemplateSchemaField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'url' | 'array' | 'object' | 'date';
  required?: boolean;
  placeholder?: string;
  description?: string;
  items?: TemplateSchemaField[];
}

export interface TemplateSchemaDefinition {
  sections: {
    personal?: boolean;
    summary?: boolean;
    education?: boolean;
    experience?: boolean;
    projects?: boolean;
    skills?: boolean;
    certifications?: boolean;
    achievements?: boolean;
    custom?: TemplateSchemaField[];
  };
  supported_fields?: string[];
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category?: string;
  thumbnail_url?: string | null;
  tex_template: string;
  schema_definition: TemplateSchemaDefinition;
  version: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  start_date: string;
  end_date: string;
  gpa?: string;
  coursework?: string;
}

export interface ExperienceItem {
  id?: string;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date: string;
  current?: boolean;
  description?: string;
  bullets: string[];
}

export interface ProjectItem {
  id?: string;
  name: string;
  description?: string;
  technologies?: string;
  github?: string;
  live_url?: string;
  bullets: string[];
}

export interface SkillCategory {
  id?: string;
  category: string;
  skills: string; // comma-separated or list
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface AchievementItem {
  id?: string;
  title: string;
  description?: string;
  date?: string;
}

export interface ResumeFormData {
  personal: PersonalInfo;
  summary?: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  custom_fields?: Record<string, unknown>;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  service_type: ServiceType;
  template_id?: string | null;
  form_data?: ResumeFormData | null;
  raw_tex: string;
  pdf_url?: string | null;
  created_at: string;
  updated_at: string;
  template?: Template;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  version_number: number;
  raw_tex: string;
  form_data?: ResumeFormData | null;
  created_at: string;
}

export type CompileJobStatus = 'pending' | 'completed' | 'failed' | 'timeout';

export interface CompileJob {
  id: string;
  resume_id?: string | null;
  user_id: string;
  status: CompileJobStatus;
  error_message?: string | null;
  duration_ms?: number | null;
  created_at: string;
  completed_at?: string | null;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface CompileRequestPayload {
  tex: string;
  engine?: 'tectonic' | 'pdflatex';
  resume_id?: string;
}

export interface CompileErrorDetail {
  line?: number | null;
  column?: number | null;
  message: string;
  raw?: string;
}

export interface CompileResponsePayload {
  success: boolean;
  pdf_base64?: string;
  error?: string;
  errors?: CompileErrorDetail[];
  line?: number | null;
  duration_ms?: number;
}
