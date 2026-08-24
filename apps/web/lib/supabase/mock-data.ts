import { Template, Resume, UserProfile } from '@resumeforge/shared-types';

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Classic Professional',
    description: 'Timeless single-column layout with refined typography and crisp horizontal section dividers. Ideal for software engineering, finance, consulting, and corporate roles.',
    category: 'Professional',
    thumbnail_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    tex_template: `\\documentclass[10pt,letterpaper]{article}
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
      \\textit{{{degree}}}{{#if field}}, {{field}}{{/if}} {{#if gpa}}(\${gpa} GPA){{/if}} & \\textit{ {{start_date}} -- {{end_date}} } \\\\
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

\\end{document}`,
    schema_definition: {
      sections: {
        personal: true,
        summary: true,
        education: true,
        experience: true,
        projects: true,
        skills: true,
        certifications: true,
        achievements: true,
      },
    },
    version: 1,
    is_active: true,
    created_at: '2026-08-24T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Modern Developer',
    description: 'Modern developer layout optimized for high-impact tech resumes. Highlights tech stacks, GitHub repositories, systems architecture, and engineering metrics.',
    category: 'Tech / Engineering',
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    tex_template: `\\documentclass[10pt,letterpaper]{article}
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

\\end{document}`,
    schema_definition: {
      sections: {
        personal: true,
        summary: true,
        education: true,
        experience: true,
        projects: true,
        skills: true,
        certifications: false,
        achievements: false,
      },
    },
    version: 1,
    is_active: true,
    created_at: '2026-08-24T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Minimal ATS Executive',
    description: 'Maximum readability, zero parsing errors. Designed strictly for Applicant Tracking Systems (ATS) with linear section flow and clean formatting.',
    category: 'ATS Optimized',
    thumbnail_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    tex_template: `\\documentclass[11pt,a4paper]{article}
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
\\textbf{{{name}}} {{#if technologies}}(\${technologies}){{/if}} \\hfill {{#if live_url}}{{live_url}}{{/if}} \\\\[2pt]
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
{{institution}} {{#if location}}-- {{location}}{{/if}} {{#if gpa}}(\${gpa} GPA){{/if}} \\\\[2pt]
{{/each}}
{{/if}}

{{#if certifications}}
\\section{Certifications}
{{#each certifications}}
\\textbf{{{name}}} -- {{issuer}} ({{date}}) \\\\
{{/each}}
{{/if}}

\\end{document}`,
    schema_definition: {
      sections: {
        personal: true,
        summary: true,
        education: true,
        experience: true,
        projects: true,
        skills: true,
        certifications: true,
        achievements: false,
      },
    },
    version: 1,
    is_active: true,
    created_at: '2026-08-24T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
];

export const DEMO_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex.developer@example.com',
  full_name: 'Alex Mercer',
  role: 'USER',
  created_at: '2026-08-24T00:00:00Z',
  updated_at: '2026-08-24T00:00:00Z',
};

export const DEMO_ADMIN: UserProfile = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'admin@resumeforge.io',
  full_name: 'Lead Administrator',
  role: 'ADMIN',
  created_at: '2026-08-24T00:00:00Z',
  updated_at: '2026-08-24T00:00:00Z',
};

export const SAMPLE_RESUME_FORM_DATA = {
  personal: {
    name: 'Alex Mercer',
    email: 'alex.mercer@gmail.com',
    phone: '+1 (555) 349-2810',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/alex-mercer',
    github: 'alexmercer-dev',
    portfolio: 'https://alexmercer.dev',
  },
  summary: 'Senior Full-Stack & Distributed Systems Architect with 7+ years of experience designing high-throughput microservices, cloud infrastructure, and low-latency APIs handling 100M+ monthly transactions.',
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      field: 'Computer Systems & Software Engineering',
      location: 'Berkeley, CA',
      start_date: '2015',
      end_date: '2019',
      gpa: '3.88',
      coursework: 'Distributed Systems, Operating Systems, Algorithms, Computer Security',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Apex Cloud Systems',
      role: 'Staff Software Engineer',
      location: 'San Francisco, CA',
      start_date: 'Jan 2022',
      end_date: 'Present',
      current: true,
      description: 'Lead engineer for the core real-time streaming pipeline processing over 45k events/sec.',
      bullets: [
        'Architected high-throughput event streaming platform using Rust and Kafka, decreasing P99 latency by 42%.',
        'Implemented end-to-end zero-trust authentication and rate-limiting gateway supporting 15M daily requests.',
        'Mentored 8 junior and mid-level engineers, introduced automated integration test suites increasing code coverage to 94%.',
      ],
    },
    {
      id: 'exp-2',
      company: 'Veloce Data Labs',
      role: 'Senior Backend Engineer',
      location: 'Mountain View, CA',
      start_date: 'Jun 2019',
      end_date: 'Dec 2021',
      current: false,
      description: 'Engineered multi-tenant SaaS backend with PostgreSQL, Go, and Redis clusters.',
      bullets: [
        'Designed database partitioning and caching strategy that reduced server infrastructure costs by $180k/yr.',
        'Developed automated CI/CD deployment pipelines on Kubernetes cutting release cycle from 3 days to 20 minutes.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'ResilientKV Distributed Store',
      description: 'High-performance distributed key-value store built on Raft consensus.',
      technologies: 'Go, Raft, gRPC, Docker',
      github: 'https://github.com/alexmercer-dev/resilient-kv',
      live_url: 'https://resilientkv.dev',
      bullets: [
        'Implemented linearizable reads and atomic multi-key transactions with snapshot isolation.',
        'Benchmarked throughput reaching 120k ops/sec with sub-5ms cluster replication.',
      ],
    },
  ],
  skills: [
    {
      id: 'skill-1',
      category: 'Languages',
      skills: 'TypeScript, Python, Go, Rust, C++, SQL',
    },
    {
      id: 'skill-2',
      category: 'Frameworks & Systems',
      skills: 'Next.js, React, Node.js, FastAPI, PostgreSQL, Redis, Kafka, gRPC',
    },
    {
      id: 'skill-3',
      category: 'DevOps & Cloud',
      skills: 'Docker, Kubernetes, AWS, Terraform, CI/CD, Linux, Prometheus',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect -- Professional',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      title: '1st Place Winner -- Global Hackathon 2023',
      description: 'Built decentralized identity verification pipeline selected out of 450+ submissions.',
      date: '2023',
    },
  ],
};
