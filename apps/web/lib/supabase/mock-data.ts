import { Template, Resume, ResumeFormData, UserProfile } from '@resumeforge/shared-types';

export const CURRENT_USER_MOCK: UserProfile = {
  id: 'a0000000-0000-0000-0000-000000000001',
  email: 'arjun.mehta.dev@example.com',
  full_name: 'Arjun Mehta',
  role: 'USER',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MASTER_LATEX_TEMPLATE = String.raw`\documentclass[letterpaper,10pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[normalem]{ulem} % Added for clean underlines
\usepackage[colorlinks=true, linkcolor=blue, urlcolor=blue]{hyperref} % Blue hyperref links
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Page Margins tuned for exact single-page fill
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1.0in}
\addtolength{\topmargin}{-0.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Section formatting with clean lines and balanced spacing
\titleformat{\section}{
  \vspace{1pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{1pt}]

\pdfgentounicode=1

% Custom command for underlined blue hyperlinks
\newcommand{\link}[2]{\href{#1}{\uline{#2}}}

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-1.5pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-1.5pt}\item
    \begin{tabular*}{0.98\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-3pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \vspace{-1.5pt}\item
    \begin{tabular*}{0.98\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-3pt}
}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}, itemsep=1.5pt, topsep=1pt]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}\vspace{-1pt}}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=0.18in, itemsep=-0.5pt, topsep=1pt]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-2pt}}

\begin{document}

%----------HEADING----------
\begin{center}
    \textbf{\Huge \scshape {{personal.name}}} \\ \vspace{2pt}
    \small {{#if personal.phone}}{{personal.phone}} $|$ {{/if}}
    \link{mailto:{{personal.email}}}{{{personal.email}}}
    {{#if personal.linkedin}} $|$ \link{{{personal.linkedin}}}{LinkedIn}{{/if}}
    {{#if personal.github}} $|$ \link{{{personal.github}}}{GitHub}{{/if}}
    {{#if personal.portfolio}} $|$ \link{{{personal.portfolio}}}{Portfolio}{{/if}}
\end{center}
\vspace{-4pt}

{{#if education}}
%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart
{{#each education}}
    \resumeSubheading
      {{{institution}}}{{{gpa}}}
      { {{degree}}{{#if field}} in {{field}}{{/if}} }{{{start_date}} -- {{end_date}}}
{{/each}}
  \resumeSubHeadingListEnd
{{/if}}

{{#if skills}}
%-----------TECHNICAL SKILLS \& COURSEWORK-----------
\section{Technical Skills \& Coursework}
 \begin{itemize}[leftmargin=0.15in, label={}, topsep=1pt, itemsep=1pt]
    \small{\item{
    {{#each skills}}
     \textbf{{{category}}:}\hspace{0.5em} {{skills}} \\[1.5pt]
    {{/each}}
    }}
 \end{itemize}
 \vspace{-2pt}
{{/if}}

{{#if experience}}
%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart
{{#each experience}}
    \resumeSubheading
      {{{company}}}{{{location}}}
      { {{role}}{{#if technologies}} $|$ {{technologies}}{{/if}} }{{{start_date}} -- {{#if current}}Present{{else}}{{end_date}}{{/if}}}
      {{#if bullets}}
      \resumeItemListStart
      {{#each bullets}}
        \resumeItem{{{this}}}
      {{/each}}
      \resumeItemListEnd
      {{/if}}
{{/each}}
  \resumeSubHeadingListEnd
{{/if}}

{{#if coding_profiles}}
%-----------CODING PROFILES-----------
\section{Coding Profiles}
 \begin{itemize}[leftmargin=0.15in, label={}, topsep=1pt, itemsep=1pt]
    \small{\item{
    {{#each coding_profiles}}
     \link{{{url}}}{\textbf{{{platform}}:}}\hspace{0.3em}{{description}}{{#unless @last}}\hspace{1.5em}$|$\hspace{1.5em}{{/unless}}
    {{/each}}
    }}
 \end{itemize}
 \vspace{-2pt}
{{/if}}

{{#if projects}}
%-----------PROJECTS-----------
\section{Projects}
    \resumeSubHeadingListStart
{{#each projects}}
      \resumeProjectHeading
          {\textbf{{{name}}}{{#if technologies}} $|$ \emph{{{technologies}}}{{/if}}}{ {{#if github}}\link{{{github}}}{GitHub}{{else}}{{#if live_url}}\link{{{live_url}}}{Demo}{{/if}}{{/if}} }
          {{#if bullets}}
          \resumeItemListStart
          {{#each bullets}}
            \resumeItem{{{this}}}
          {{/each}}
          \resumeItemListEnd
          {{/if}}
{{/each}}
    \resumeSubHeadingListEnd
{{/if}}

{{#if achievements}}
%-----------ACHIEVEMENTS-----------
\section{Achievements}
  \resumeItemListStart
{{#each achievements}}
    \resumeItem{\textbf{{{title}}}{{#if description}} -- {{description}}{{/if}}{{#if url}} \link{{{url}}}{[Certificate]}{{/if}}}
{{/each}}
  \resumeItemListEnd
{{/if}}

\end{document}`;

export const INITIAL_RAW_TEX = String.raw`\documentclass[letterpaper,10pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[normalem]{ulem} % Added for clean underlines
\usepackage[colorlinks=true, linkcolor=blue, urlcolor=blue]{hyperref} % Blue hyperref links
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Page Margins tuned for exact single-page fill
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1.0in}
\addtolength{\topmargin}{-0.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Section formatting with clean lines and balanced spacing
\titleformat{\section}{
  \vspace{1pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{1pt}]

\pdfgentounicode=1

% Custom command for underlined blue hyperlinks
\newcommand{\link}[2]{\href{#1}{\uline{#2}}}

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-1.5pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-1.5pt}\item
    \begin{tabular*}{0.98\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-3pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \vspace{-1.5pt}\item
    \begin{tabular*}{0.98\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-3pt}
}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}, itemsep=1.5pt, topsep=1pt]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}\vspace{-1pt}}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=0.18in, itemsep=-0.5pt, topsep=1pt]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-2pt}}

\begin{document}

%----------HEADING----------
\begin{center}
    \textbf{\Huge \scshape Arjun Mehta} \\ \vspace{2pt}
    \small +91 9876543210 $|$
    \link{mailto:arjun.mehta.dev@example.com}{arjun.mehta.dev@example.com} $|$
    \link{https://www.linkedin.com/in/arjun-mehta-dev/}{LinkedIn} $|$
    \link{https://github.com/arjunmehta-dev}{GitHub} $|$
    \link{https://arjunmehta.dev/}{Portfolio}
\end{center}
\vspace{-4pt}

%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart
    \resumeSubheading
      {Western Institute of Technology, Ahmedabad-Gujarat, }{CGPA: 8.6/10}
      {B.Tech. in Computer Science \& Engineering}{July 2023 -- May 2027}
    \resumeSubheading
      {Silver Oak Science Academy, Surat-Gujarat}{98.72 percentile}
      {12th Board, GSEB}{May 2022 -- Mar 2023}
    \resumeSubheading
      {Green Valley High School, Surat-Gujarat}{97.84 percentile}
      {10th Board, GSEB}{June 2020 -- Apr 2021}
  \resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS \& COURSEWORK-----------
\section{Technical Skills \& Coursework}
 \begin{itemize}[leftmargin=0.15in, label={}, topsep=1pt, itemsep=1pt]
    \small{\item{
     \textbf{Languages:}\hspace{0.5em} C++, C, Python, JavaScript, TypeScript, SQL \\[1.5pt]
     \textbf{Core Technologies:}\hspace{0.5em} HTML, CSS, Node.js, React.js, Next.js, REST APIs, FastAPI \\[1.5pt]
     \textbf{Databases:}\hspace{0.5em} PostgreSQL, MySQL, MongoDB, Redis \\[1.5pt]
     \textbf{Tools \& DevOps:}\hspace{0.5em} GitHub, VS Code, Docker, Postman, GitHub Actions \\[1.5pt]
     \textbf{Concepts:}\hspace{0.5em} Data Structures \& Algorithms, OOP, DBMS, Operating Systems, Computer Networks, Computer Architecture, System Design, Microservices \\[1.5pt]
     \textbf{Coursework:}\hspace{0.5em} Full Stack Web Development, Distributed Systems, Cloud Architecture
    }}
 \end{itemize}
 \vspace{-2pt}

%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart
    \resumeSubheading
      {NovaStack Technologies}{Vadodara, Gujarat}
      {Software Engineer Intern $|$ React, FastAPI, PostgreSQL, Redis}{May 2026 -- Jul 2026}
      \resumeItemListStart
        \resumeItem{Developed REST APIs and secured application services using JWT and RBAC for a collaborative project management platform.}
        \resumeItem{Designed a version control module using SQLAlchemy and graph-based algorithms to support document branching, line-by-line diffs, and 3-way merge conflict resolution.}
      \resumeItemListEnd
  \resumeSubHeadingListEnd

%-----------CODING PROFILES-----------
\section{Coding Profiles}
 \begin{itemize}[leftmargin=0.15in, label={}, topsep=1pt, itemsep=1pt]
    \small{\item{
     \link{https://leetcode.com/u/arjun_mehta_dev/}{\textbf{LeetCode:}}\hspace{0.3em}Solved 275+ algorithmic problems\hspace{1.5em}$|$\hspace{1.5em}\link{https://codeforces.com/profile/arjun_mehta01}{\textbf{Codeforces:}}\hspace{0.3em}Solved 180+ problems
    }}
 \end{itemize}
 \vspace{-2pt}

%-----------PROJECTS-----------
\section{Projects}
    \resumeSubHeadingListStart
      \resumeProjectHeading
          {\textbf{StudySphere - Collaborative Learning Platform} $|$ \emph{FastAPI, React, PostgreSQL, Docker}}{ \link{https://github.com/arjunmehta-dev/studysphere}{GitHub} }
          \resumeItemListStart
            \resumeItem{Built a full-stack learning platform featuring structured study modules, automated testing, and a Monaco Editor-based coding workspace protected using JWT and RBAC.}
            \resumeItem{Implemented a Git-inspired document versioning system using SQLAlchemy and graph traversal techniques for branching, line-by-line diffs, and 3-way merge conflict resolution.}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{SecureTrack - Security Awareness Platform} $|$ \emph{MERN, Tailwind, Nodemailer, JWT}}{ \link{https://github.com/arjunmehta-dev/securetrack}{GitHub} }
          \resumeItemListStart
            \resumeItem{Developed a full-stack security awareness platform for controlled simulations and employee interaction analytics, including email telemetry, interaction tracking, and reporting.}
            \resumeItem{Implemented role-based access, bulk user onboarding, and dynamic risk dashboards with analytics visualizations and gamified security scores.}
          \resumeItemListEnd
    \resumeSubHeadingListEnd

%-----------ACHIEVEMENTS-----------
\section{Achievements}
  \resumeItemListStart
    \resumeItem{\textbf{Winner of National Student Innovation Challenge 2026} -- FinTech Automation Track \link{https://example.com/certificates/fintech-2026}{[Certificate]}}
    \resumeItem{\textbf{Top 10 in CodeSprint Hackathon 2026} -- Smart Campus Assistant \link{https://example.com/certificates/codesprint-2026}{[Certificate]}}
    \resumeItem{\textbf{Finalist in BuildForTomorrow Hackathon} -- Environmental Monitoring Platform \link{https://example.com/certificates/buildfortomorrow-2026}{[Certificate]}}
  \resumeItemListEnd

\end{document}`;

export const SAMPLE_RESUME_FORM_DATA: ResumeFormData = {
  personal: {
    name: 'Arjun Mehta',
    email: 'arjun.mehta.dev@example.com',
    phone: '+91 9876543210',
    location: 'Ahmedabad, Gujarat',
    linkedin: 'https://www.linkedin.com/in/arjun-mehta-dev/',
    github: 'https://github.com/arjunmehta-dev',
    portfolio: 'https://arjunmehta.dev/',
  },
  education: [
    {
      institution: 'Western Institute of Technology, Ahmedabad-Gujarat, ',
      degree: 'B.Tech.',
      field: 'Computer Science & Engineering',
      gpa: 'CGPA: 8.6/10',
      start_date: 'July 2023',
      end_date: 'May 2027',
      location: 'Ahmedabad, Gujarat',
    },
    {
      institution: 'Silver Oak Science Academy, Surat-Gujarat',
      degree: '12th Board',
      field: 'GSEB',
      gpa: '98.72 percentile',
      start_date: 'May 2022',
      end_date: 'Mar 2023',
      location: 'Surat, Gujarat',
    },
    {
      institution: 'Green Valley High School, Surat-Gujarat',
      degree: '10th Board',
      field: 'GSEB',
      gpa: '97.84 percentile',
      start_date: 'June 2020',
      end_date: 'Apr 2021',
      location: 'Surat, Gujarat',
    },
  ],
  skills: [
    { category: 'Languages', skills: 'C++, C, Python, JavaScript, TypeScript, SQL' },
    { category: 'Core Technologies', skills: 'HTML, CSS, Node.js, React.js, Next.js, REST APIs, FastAPI' },
    { category: 'Databases', skills: 'PostgreSQL, MySQL, MongoDB, Redis' },
    { category: 'Tools & DevOps', skills: 'GitHub, VS Code, Docker, Postman, GitHub Actions' },
    { category: 'Concepts', skills: 'Data Structures & Algorithms, OOP, DBMS, Operating Systems, Computer Networks, Computer Architecture, System Design, Microservices' },
    { category: 'Coursework', skills: 'Full Stack Web Development, Distributed Systems, Cloud Architecture' },
  ],
  experience: [
    {
      company: 'NovaStack Technologies',
      role: 'Software Engineer Intern',
      location: 'Vadodara, Gujarat',
      technologies: 'React, FastAPI, PostgreSQL, Redis',
      start_date: 'May 2026',
      end_date: 'Jul 2026',
      current: false,
      bullets: [
        'Developed REST APIs and secured application services using JWT and RBAC for a collaborative project management platform.',
        'Designed a version control module using SQLAlchemy and graph-based algorithms to support document branching, line-by-line diffs, and 3-way merge conflict resolution.',
      ],
    },
  ],
  coding_profiles: [
    {
      platform: 'LeetCode',
      url: 'https://leetcode.com/u/arjun_mehta_dev/',
      description: 'Solved 275+ algorithmic problems',
    },
    {
      platform: 'Codeforces',
      url: 'https://codeforces.com/profile/arjun_mehta01',
      description: 'Solved 180+ problems',
    },
  ],
  projects: [
    {
      name: 'StudySphere - Collaborative Learning Platform',
      technologies: 'FastAPI, React, PostgreSQL, Docker',
      github: 'https://github.com/arjunmehta-dev/studysphere',
      bullets: [
        'Built a full-stack learning platform featuring structured study modules, automated testing, and a Monaco Editor-based coding workspace protected using JWT and RBAC.',
        'Implemented a Git-inspired document versioning system using SQLAlchemy and graph traversal techniques for branching, line-by-line diffs, and 3-way merge conflict resolution.',
      ],
    },
    {
      name: 'SecureTrack - Security Awareness Platform',
      technologies: 'MERN, Tailwind, Nodemailer, JWT',
      github: 'https://github.com/arjunmehta-dev/securetrack',
      bullets: [
        'Developed a full-stack security awareness platform for controlled simulations and employee interaction analytics, including email telemetry, interaction tracking, and reporting.',
        'Implemented role-based access, bulk user onboarding, and dynamic risk dashboards with analytics visualizations and gamified security scores.',
      ],
    },
  ],
  certifications: [],
  achievements: [
    {
      title: 'Winner of National Student Innovation Challenge 2026',
      description: 'FinTech Automation Track',
      url: 'https://example.com/certificates/fintech-2026',
    },
    {
      title: 'Top 10 in CodeSprint Hackathon 2026',
      description: 'Smart Campus Assistant',
      url: 'https://example.com/certificates/codesprint-2026',
    },
    {
      title: 'Finalist in BuildForTomorrow Hackathon',
      description: 'Environmental Monitoring Platform',
      url: 'https://example.com/certificates/buildfortomorrow-2026',
    },
  ],
};

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'ATS Single-Page Engineer Master',
    description: 'Clean single-page ATS-optimized engineering resume with balanced section dividers, hyperlinks, education table, tech skills grid, experience, coding profiles, projects, and achievements.',
    category: 'Software Engineering',
    thumbnail_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    tex_template: MASTER_LATEX_TEMPLATE,
    schema_definition: {
      sections: {
        personal: true,
        summary: false,
        education: true,
        skills: true,
        experience: true,
        coding_profiles: true,
        projects: true,
        certifications: false,
        achievements: true,
      },
    },
    version: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_RESUMES: Resume[] = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    user_id: CURRENT_USER_MOCK.id,
    title: 'Software Engineer Resume — Arjun Mehta',
    service_type: 'maker',
    template_id: '11111111-1111-1111-1111-111111111111',
    form_data: SAMPLE_RESUME_FORM_DATA,
    raw_tex: INITIAL_RAW_TEX,
    pdf_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
