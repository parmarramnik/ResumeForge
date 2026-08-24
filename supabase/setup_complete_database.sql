-- =========================================================================
-- ResumeForge Complete Database Setup (Schema + RLS + 3 ATS Templates)
-- Paste this entire file into: https://supabase.com/dashboard/project/dhraoeuypiaobmccgtff/sql/new
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to create profile automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  thumbnail_url TEXT,
  tex_template TEXT NOT NULL,
  schema_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  service_type TEXT NOT NULL CHECK (service_type IN ('maker', 'generator')),
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  form_data JSONB,
  raw_tex TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Resume Versions Table
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  raw_tex TEXT NOT NULL,
  form_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Compile Jobs Table
CREATE TABLE IF NOT EXISTS public.compile_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'timeout')),
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_template_id ON public.resumes(template_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_compile_jobs_user_id ON public.compile_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compile_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ================= RLS POLICIES =================

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Templates Policies
DROP POLICY IF EXISTS "Anyone can view active templates" ON public.templates;
CREATE POLICY "Anyone can view active templates"
  ON public.templates FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert templates" ON public.templates;
CREATE POLICY "Admins can insert templates"
  ON public.templates FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update templates" ON public.templates;
CREATE POLICY "Admins can update templates"
  ON public.templates FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete templates" ON public.templates;
CREATE POLICY "Admins can delete templates"
  ON public.templates FOR DELETE
  USING (public.is_admin());

-- Resumes Policies
DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
CREATE POLICY "Users can view own resumes"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
CREATE POLICY "Users can insert own resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
CREATE POLICY "Users can update own resumes"
  ON public.resumes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
CREATE POLICY "Users can delete own resumes"
  ON public.resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Resume Versions Policies
DROP POLICY IF EXISTS "Users can view own resume versions" ON public.resume_versions;
CREATE POLICY "Users can view own resume versions"
  ON public.resume_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resumes
      WHERE resumes.id = resume_versions.resume_id
      AND (resumes.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users can insert own resume versions" ON public.resume_versions;
CREATE POLICY "Users can insert own resume versions"
  ON public.resume_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resumes
      WHERE resumes.id = resume_versions.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

-- Compile Jobs Policies
DROP POLICY IF EXISTS "Users can view own compile jobs" ON public.compile_jobs;
CREATE POLICY "Users can view own compile jobs"
  ON public.compile_jobs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own compile jobs" ON public.compile_jobs;
CREATE POLICY "Users can insert own compile jobs"
  ON public.compile_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ================= SEED TEMPLATES =================

-- 1. Classic Professional
INSERT INTO public.templates (
  id,
  title,
  description,
  category,
  thumbnail_url,
  tex_template,
  schema_definition,
  version,
  is_active
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Classic Professional',
  'Timeless single-column layout with refined typography and crisp horizontal section dividers. Ideal for software engineering, finance, consulting, and corporate roles.',
  'Professional',
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
  E'\\documentclass[10pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[margin=0.65in]{geometry}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.1in}
\\addtolength{\\evensidemargin}{-0.1in}
\\addtolength{\\textwidth}{0.2in}
\\addtolength{\\topmargin}{-0.1in}
\\addtolength{\\textheight}{0.2in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\begin{document}

%----------HEADING----------
\\begin{center}
  {\\Huge \\scshape {{personal.name}} } \\\\[4pt]
  \\small {{personal.email}} 
  {{#if personal.phone}} $|$ {{personal.phone}} {{/if}}
  {{#if personal.location}} $|$ {{personal.location}} {{/if}} \\\\[2pt]
  {{#if personal.linkedin}} \\href{{{personal.linkedin}}}{\\underline{LinkedIn}} {{/if}}
  {{#if personal.github}} $|$ \\href{{{personal.github}}}{\\underline{GitHub}} {{/if}}
  {{#if personal.portfolio}} $|$ \\href{{{personal.portfolio}}}{\\underline{Portfolio}} {{/if}}
\\end{center}

{{#if summary}}
%-----------SUMMARY-----------
\\section{Summary}
\\vspace{1pt}
{{summary}}
\\vspace{2pt}
{{/if}}

{{#if experience}}
%-----------EXPERIENCE-----------
\\section{Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
{{#each experience}}
  \\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{{{company}}} & {{location}} \\\\[1pt]
      \\textit{{{role}}} & \\textit{ {{start_date}} -- {{#if current}}Present{{else}}{{end_date}}{{/if}} } \\\\
    \\end{tabular*}\\vspace{-5pt}
    {{#if description}}
    \\small{{{description}}}
    {{/if}}
    {{#if bullets}}
    \\begin{itemize}[leftmargin=0.15in, topsep=2pt, itemsep=1.5pt]
    {{#each bullets}}
      \\item \\small{{{this}}}
    {{/each}}
    \\end{itemize}
    {{/if}}
    \\vspace{4pt}
{{/each}}
\\end{itemize}
{{/if}}

{{#if projects}}
%-----------PROJECTS-----------
\\section{Projects}
\\begin{itemize}[leftmargin=0.15in, label={}]
{{#each projects}}
  \\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{{{name}}} {{#if technologies}} $|$ \\textit{\\small{{{technologies}}}} {{/if}} & 
      {{#if live_url}} \\href{{{live_url}}}{\\underline{Demo}} {{/if}} 
      {{#if github}} \\href{{{github}}}{\\underline{Code}} {{/if}} \\\\
    \\end{tabular*}\\vspace{-5pt}
    {{#if description}}
    \\small{{{description}}}
    {{/if}}
    {{#if bullets}}
    \\begin{itemize}[leftmargin=0.15in, topsep=2pt, itemsep=1.5pt]
    {{#each bullets}}
      \\item \\small{{{this}}}
    {{/each}}
    \\end{itemize}
    {{/if}}
    \\vspace{4pt}
{{/each}}
\\end{itemize}
{{/if}}

{{#if education}}
%-----------EDUCATION-----------
\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
{{#each education}}
  \\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{{{institution}}} & {{location}} \\\\[1pt]
      \\textit{{{degree}}}{{#if field}}, {{field}}{{/if}} {{#if gpa}}(${{gpa}}$ GPA){{/if}} & \\textit{ {{start_date}} -- {{end_date}} } \\\\
    \\end{tabular*}\\vspace{-5pt}
    {{#if coursework}}
    \\small{\\textbf{Coursework:} {{coursework}}}
    {{/if}}
    \\vspace{3pt}
{{/each}}
\\end{itemize}
{{/if}}

{{#if skills}}
%-----------SKILLS-----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\small{\\item{
  {{#each skills}}
    \\textbf{{{category}}}: {{skills}} \\\\[2pt]
  {{/each}}
  }}
\\end{itemize}
\\vspace{-4pt}
{{/if}}

{{#if certifications}}
%-----------CERTIFICATIONS-----------
\\section{Certifications}
\\begin{itemize}[leftmargin=0.15in, label={}]
{{#each certifications}}
  \\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{{{name}}} -- \\textit{{{issuer}}} & \\textit{{{date}}} \\\\
    \\end{tabular*}\\vspace{-4pt}
{{/each}}
\\end{itemize}
{{/if}}

{{#if achievements}}
%-----------ACHIEVEMENTS-----------
\\section{Honors \\& Awards}
\\begin{itemize}[leftmargin=0.15in, label={}]
{{#each achievements}}
  \\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{{{title}}} {{#if description}} -- \\small{{{description}}} {{/if}} & \\textit{{{date}}} \\\\
    \\end{tabular*}\\vspace{-4pt}
{{/each}}
\\end{itemize}
{{/if}}

\\end{document}',
  '{"sections": {"personal": true, "summary": true, "education": true, "experience": true, "projects": true, "skills": true, "certifications": true, "achievements": true}}'::jsonb,
  1,
  true
) ON CONFLICT (id) DO NOTHING;

-- 2. Modern Developer
INSERT INTO public.templates (
  id,
  title,
  description,
  category,
  thumbnail_url,
  tex_template,
  schema_definition,
  version,
  is_active
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Modern Developer',
  'Modern developer layout optimized for high-impact tech resumes. Highlights tech stacks, GitHub repositories, systems architecture, and engineering metrics.',
  'Tech / Engineering',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
  E'\\documentclass[10pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}
\\usepackage[margin=0.6in]{geometry}

\\definecolor{primary}{RGB}{30, 41, 59}
\\definecolor{secondary}{RGB}{71, 85, 105}
\\definecolor{accent}{RGB}{15, 23, 42}

\\pagestyle{empty}
\\raggedbottom
\\raggedright

\\titleformat{\\section}{
  \\vspace{-3pt}\\color{accent}\\bfseries\\uppercase\\normalsize
}{}{0em}{}[\\color{secondary}\\titlerule \\vspace{-4pt}]

\\begin{document}

% Header
\\begin{center}
  {\\LARGE \\bfseries \\color{primary} {{personal.name}} } \\\\[3pt]
  \\small \\color{secondary}
  {{personal.email}}
  {{#if personal.phone}} $|$ {{personal.phone}} {{/if}}
  {{#if personal.location}} $|$ {{personal.location}} {{/if}}
  {{#if personal.github}} $|$ \\href{{{personal.github}}}{\\underline{github.com/{{personal.github}}}} {{/if}}
  {{#if personal.linkedin}} $|$ \\href{{{personal.linkedin}}}{\\underline{LinkedIn}} {{/if}}
\\end{center}

{{#if summary}}
\\vspace{-4pt}
\\section{Profile}
\\vspace{1pt}
\\small{{{summary}}}
\\vspace{3pt}
{{/if}}

{{#if skills}}
\\section{Core Technologies}
\\vspace{2pt}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\small{\\item{
  {{#each skills}}
    \\textbf{{{category}}}: {{skills}} \\\\[1.5pt]
  {{/each}}
  }}
\\end{itemize}
\\vspace{-4pt}
{{/if}}

{{#if experience}}
\\section{Work Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
{{#each experience}}
  \\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{{{role}}} -- \\textbf{\\color{primary} {{company}} } {{#if location}}({{location}}){{/if}} & \\textit{\\small {{start_date}} -- {{#if current}}Present{{else}}{{end_date}}{{/if}} } \\\\
    \\end{tabular*}\\vspace{-5pt}
    {{#if bullets}}
    \\begin{itemize}[leftmargin=0.15in, topsep=1.5pt, itemsep=1.5pt]
    {{#each bullets}}
      \\item \\small{{{this}}}
    {{/each}}
    \\end{itemize}
    {{/if}}
    \\vspace{3pt}
{{/each}}
\\end{itemize}
{{/if}}

{{#if projects}}
\\section{Key Projects \\& Open Source}
\\begin{itemize}[leftmargin=0.15in, label={}]
{{#each projects}}
  \\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{{{name}}} {{#if technologies}} $|$ \\textit{\\small{{{technologies}}}} {{/if}} & 
      {{#if github}} \\href{{{github}}}{\\underline{GitHub}} {{/if}} 
      {{#if live_url}} $|$ \\href{{{live_url}}}{\\underline{Live}} {{/if}} \\\\
    \\end{tabular*}\\vspace{-5pt}
    {{#if bullets}}
    \\begin{itemize}[leftmargin=0.15in, topsep=1.5pt, itemsep=1.5pt]
    {{#each bullets}}
      \\item \\small{{{this}}}
    {{/each}}
    \\end{itemize}
    {{/if}}
    \\vspace{3pt}
{{/each}}
\\end{itemize}
{{/if}}

{{#if education}}
\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
{{#each education}}
  \\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{{{institution}}} -- \\textit{{{degree}}}{{#if field}} in {{field}}{{/if}} & \\textit{\\small {{start_date}} -- {{end_date}} } \\\\
    \\end{tabular*}\\vspace{-5pt}
    {{#if gpa}}
    \\small{GPA: {{gpa}}}
    {{/if}}
    \\vspace{2pt}
{{/each}}
\\end{itemize}
{{/if}}

\\end{document}',
  '{"sections": {"personal": true, "summary": true, "education": true, "experience": true, "projects": true, "skills": true, "certifications": false, "achievements": false}}'::jsonb,
  1,
  true
) ON CONFLICT (id) DO NOTHING;

-- 3. Minimal ATS
INSERT INTO public.templates (
  id,
  title,
  description,
  category,
  thumbnail_url,
  tex_template,
  schema_definition,
  version,
  is_active
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Minimal ATS Executive',
  'Maximum readability, zero parsing errors. Designed strictly for Applicant Tracking Systems (ATS) with linear section flow and clean formatting.',
  'ATS Optimized',
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
  E'\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}

\\pagestyle{empty}
\\raggedright
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{4pt}

\\titleformat{\\section}{\\bfseries\\large\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{8pt}{4pt}

\\begin{document}

% Header
{\\LARGE \\textbf{{{personal.name}}} } \\\\[3pt]
{{personal.email}} \\quad {{personal.phone}} \\quad {{personal.location}} \\\\[1pt]
{{#if personal.linkedin}} {{personal.linkedin}} \\quad {{/if}}
{{#if personal.github}} {{personal.github}} {{/if}}

{{#if summary}}
\\section{Professional Summary}
{{summary}}
{{/if}}

{{#if skills}}
\\section{Skills}
{{#each skills}}
\\textbf{{{category}}}: {{skills}} \\\\
{{/each}}
{{/if}}

{{#if experience}}
\\section{Experience}
{{#each experience}}
\\textbf{{{role}}} $|$ \\textbf{{{company}}} \\hfill {{start_date}} -- {{#if current}}Present{{else}}{{end_date}}{{/if}} \\\\[2pt]
{{#if description}}
{{description}}\\\\
{{/if}}
{{#if bullets}}
\\begin{itemize}[leftmargin=15pt, topsep=1pt, itemsep=1pt]
{{#each bullets}}
  \\item {{this}}
{{/each}}
\\end{itemize}
{{/if}}
\\vspace{3pt}
{{/each}}
{{/if}}

{{#if projects}}
\\section{Projects}
{{#each projects}}
\\textbf{{{name}}} {{#if technologies}}(${{technologies}}$){{/if}} \\hfill {{#if live_url}}{{live_url}}{{/if}} \\\\[2pt]
{{#if bullets}}
\\begin{itemize}[leftmargin=15pt, topsep=1pt, itemsep=1pt]
{{#each bullets}}
  \\item {{this}}
{{/each}}
\\end{itemize}
{{/if}}
\\vspace{2pt}
{{/each}}
{{/if}}

{{#if education}}
\\section{Education}
{{#each education}}
\\textbf{{{degree}}}{{#if field}}, {{field}}{{/if}} \\hfill {{start_date}} -- {{end_date}} \\\\[1pt]
{{institution}} {{#if location}}-- {{location}}{{/if}} {{#if gpa}}(${{gpa}}$ GPA){{/if}} \\\\[2pt]
{{/each}}
{{/if}}

{{#if certifications}}
\\section{Certifications}
{{#each certifications}}
\\textbf{{{name}}} -- {{issuer}} ({{date}}) \\\\
{{/each}}
{{/if}}

\\end{document}',
  '{"sections": {"personal": true, "summary": true, "education": true, "experience": true, "projects": true, "skills": true, "certifications": true, "achievements": false}}'::jsonb,
  1,
  true
) ON CONFLICT (id) DO NOTHING;
