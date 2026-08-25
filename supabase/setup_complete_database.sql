-- =========================================================================
-- ResumeForge Complete Database Setup (Single Template User Schema)
-- Paste this entire file into: https://supabase.com/dashboard/project/dhraoeuypiaobmccgtff/sql/new
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'USER',
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
    'USER'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth.users into public.profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'USER'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Software Engineering',
  thumbnail_url TEXT,
  tex_template TEXT NOT NULL,
  schema_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Software Engineer Resume',
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

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_template_id ON public.resumes(template_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_compile_jobs_user_id ON public.compile_jobs(user_id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compile_jobs ENABLE ROW LEVEL SECURITY;

-- ================= RLS POLICIES =================

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Templates Policies
DROP POLICY IF EXISTS "Anyone can view active templates" ON public.templates;
CREATE POLICY "Anyone can view active templates"
  ON public.templates FOR SELECT
  USING (true);

-- Resumes Policies
DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
CREATE POLICY "Users can view own resumes"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id);

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
      AND resumes.user_id = auth.uid()
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
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own compile jobs" ON public.compile_jobs;
CREATE POLICY "Users can insert own compile jobs"
  ON public.compile_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ================= SEED SINGLE ATS MASTER TEMPLATE =================

DELETE FROM public.templates;

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
  'ATS Software Engineer Classic',
  'Clean single-page ATS-optimized engineering resume with balanced section dividers, hyperlinks, education table, tech skills grid, experience, projects, and achievements.',
  'Software Engineering',
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
  E'\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[normalem]{ulem} % Added for clean underlines
\\usepackage[colorlinks=true, linkcolor=blue, urlcolor=blue]{hyperref} % Blue hyperref links
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Page Margins tuned for exact single-page fill
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-0.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting with clean lines and balanced spacing
\\titleformat{\\section}{
  \\vspace{1pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{1pt}]

\\pdfgentounicode=1

% Custom command for underlined blue hyperlinks
\\newcommand{\\link}[2]{\\href{#1}{\\uline{#2}}}

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-1.5pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1.5pt}\\item
    \\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-3pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\vspace{-1.5pt}\\item
    \\begin{tabular*}{0.98\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-3pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}, itemsep=1.5pt, topsep=1pt]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}\\vspace{-1pt}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.18in, itemsep=-0.5pt, topsep=1pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-2pt}}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape {{personal.name}}} \\\\ \\vspace{2pt}
    \\small {{#if personal.phone}}{{personal.phone}} $|$ {{/if}}
    \\link{mailto:{{personal.email}}}{{{personal.email}}}
    {{#if personal.linkedin}} $|$ \\link{{{personal.linkedin}}}{LinkedIn}{{/if}}
    {{#if personal.github}} $|$ \\link{{{personal.github}}}{GitHub}{{/if}}
    {{#if personal.portfolio}} $|$ \\link{{{personal.portfolio}}}{Portfolio}{{/if}}
\\end{center}
\\vspace{-4pt}

{{#if education}}
%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
{{#each education}}
    \\resumeSubheading
      {{{institution}}}{{{gpa}}}
      { {{degree}}{{#if field}} in {{field}}{{/if}} }{{{start_date}} -- {{end_date}}}
{{/each}}
  \\resumeSubHeadingListEnd
{{/if}}

{{#if skills}}
%-----------TECHNICAL SKILLS \\& COURSEWORK-----------
\\section{Technical Skills \\& Coursework}
 \\begin{itemize}[leftmargin=0.15in, label={}, topsep=1pt, itemsep=1pt]
    \\small{\\item{
    {{#each skills}}
     \\textbf{{{category}}:}\\hspace{0.5em} {{skills}} \\\\[1.5pt]
    {{/each}}
    }}
 \\end{itemize}
 \\vspace{-2pt}
{{/if}}

{{#if experience}}
%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
{{#each experience}}
    \\resumeSubheading
      {{{company}}}{{{location}}}
      { {{role}}{{#if technologies}} $|$ {{technologies}}{{/if}} }{{{start_date}} -- {{#if current}}Present{{else}}{{end_date}}{{/if}}}
      {{#if bullets}}
      \\resumeItemListStart
      {{#each bullets}}
        \\resumeItem{{{this}}}
      {{/each}}
      \\resumeItemListEnd
      {{/if}}
{{/each}}
  \\resumeSubHeadingListEnd
{{/if}}

{{#if coding_profiles}}
%-----------CODING PROFILES-----------
\\section{Coding Profiles}
  \\resumeSubHeadingListStart
{{#each coding_profiles}}
    \\resumeProjectHeading
      { \\link{{{url}}}{\\textbf{{{platform}}:}} {{description}} }{}
{{/each}}
  \\resumeSubHeadingListEnd
{{/if}}

{{#if projects}}
%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
{{#each projects}}
      \\resumeProjectHeading
          { \\textbf{{{name}}}{{#if technologies}} $|$ \\emph{{{technologies}}}{{/if}} }{ {{#if github}}\\link{{{github}}}{GitHub}{{else}}{{#if live_url}}\\link{{{live_url}}}{Demo}{{/if}}{{/if}} }
          {{#if bullets}}
          \\resumeItemListStart
          {{#each bullets}}
            \\resumeItem{{{this}}}
          {{/each}}
          \\resumeItemListEnd
          {{/if}}
{{/each}}
    \\resumeSubHeadingListEnd
{{/if}}

{{#if achievements}}
%-----------ACHIEVEMENTS-----------
\\section{Achievements}
    \\resumeItemListStart
    {{#each achievements}}
      \\resumeItem{ \\textbf{{{title}}}{{#if description}} -- {{description}}{{/if}} {{#if url}}\\link{{{url}}}{[Certificate]}{{/if}} }
    {{/each}}
    \\resumeItemListEnd
{{/if}}

\\end{document}',
  '{"sections": {"personal": true, "summary": false, "education": true, "skills": true, "experience": true, "coding_profiles": true, "projects": true, "certifications": false, "achievements": true}}'::jsonb,
  1,
  true
);
