export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
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
  custom_links?: Array<{ label: string; url: string }>;
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
  bullets?: string[];
}

export interface ExperienceItem {
  id?: string;
  company: string;
  role: string;
  location?: string;
  technologies?: string;
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
  live_url?: string;
  github?: string;
  bullets?: string[];
}

export interface SkillCategory {
  id?: string;
  category: string;
  skills: string;
}

export interface CodingProfileItem {
  id?: string;
  platform: string;
  url: string;
  description?: string;
  solved_count?: string;
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface AchievementItem {
  id?: string;
  title: string;
  description?: string;
  date?: string;
  url?: string;
}

export interface ResumeFormData {
  personal: PersonalInfo;
  summary?: string;
  education: EducationItem[];
  skills: SkillCategory[];
  experience: ExperienceItem[];
  coding_profiles?: CodingProfileItem[];
  projects: ProjectItem[];
  certifications?: CertificationItem[];
  achievements?: AchievementItem[];
  custom_fields?: Record<string, unknown>;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  tex_template: string;
  schema_definition: Record<string, unknown>;
  version: number;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  service_type: 'maker' | 'generator';
  template_id: string | null;
  form_data: ResumeFormData | null;
  raw_tex: string;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  template?: Template;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  version_number: number;
  raw_tex: string;
  form_data: ResumeFormData | null;
  created_at: string;
}

export interface CompileJob {
  id: string;
  resume_id?: string | null;
  user_id: string;
  status: 'pending' | 'completed' | 'failed' | 'timeout';
  error_message?: string | null;
  duration_ms?: number | null;
  created_at: string;
  completed_at?: string | null;
}

export interface CompileErrorDetail {
  line?: number;
  message: string;
  snippet?: string;
}

export interface CompileResponse {
  success: boolean;
  pdf_base64?: string;
  pdf_url?: string;
  error?: string;
  line?: number;
  errors?: CompileErrorDetail[];
  duration_ms?: number;
}
