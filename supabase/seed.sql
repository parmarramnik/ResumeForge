-- =========================================================================
-- ResumeForge Seed Data (Single Master ATS Template)
-- =========================================================================

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
      {{{institution}}}{{{#if gpa}}{{gpa}}{{else}}{{location}}{{/if}}}
      {{{degree}}}{{#if field}} in {{field}}{{/if}}{{{start_date}} -- {{end_date}}}
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
      {{{role}}}{{#if technologies}} $|$ {{technologies}}{{/if}}{{{start_date}} -- {{#if current}}Present{{else}}{{end_date}}{{/if}}}
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

{{#if projects}}
%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
{{#each projects}}
      \\resumeProjectHeading
          {\\textbf{{{name}}}}{{#if technologies}} $|$ \\emph{{{technologies}}}{{/if}}{{#if github}}{\\link{{{github}}}{GitHub}}{{else}}{{#if live_url}}{\\link{{{live_url}}}{Demo}}{{/if}}{{/if}}
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
      \\resumeItem{\\textbf{{{title}}}}{{#if description}} -- {{description}}{{/if}} {{#if url}}\\link{{{url}}}{[Certificate]}{{/if}}}
    {{/each}}
    \\resumeItemListEnd
{{/if}}

\\end{document}',
  '{"sections": {"personal": true, "summary": false, "education": true, "experience": true, "projects": true, "skills": true, "certifications": false, "achievements": true}}'::jsonb,
  1,
  true
);
