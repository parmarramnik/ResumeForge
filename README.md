# ResumeForge — Production-Quality LaTeX Resume Platform

**ResumeForge** is an enterprise-grade resume platform architected around two conceptually distinct services:
1. **Resume Maker (LaTeX IDE)**: Direct LaTeX authoring with Monaco editor, real-time sandboxed compilation, line error diagnostics, and `.tex` / PDF exports.
2. **Resume Generator (Structured Form Wizard)**: Multi-step data input powered by administrator-controlled ATS templates, AST-safe interpolation engine, mandatory LaTeX escaping, and instant PDF preview.

---

## 🏛️ System Architecture

```text
                       ┌────────────────────────────┐
                       │    Next.js 15 App Router   │
                       │                            │
                       │  Authentication (Supabase) │
                       │  Dashboard & Resumes       │
                       │  Resume Maker (Monaco IDE) │
                       │  Resume Generator (Wizard) │
                       │  Admin Operations Portal   │
                       │  API / BFF Rate Limiter    │
                       └─────────────┬──────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              ┌──────────┐    ┌───────────┐    ┌──────────┐
              │ Supabase │    │ Compiler  │    │ Supabase │
              │ Auth/DB  │    │ Microserv │    │ Storage  │
              │  (RLS)   │    │ (FastAPI) │    │          │
              └──────────┘    └─────┬─────┘    └──────────┘
                                    │
                              ┌─────▼─────┐
                              │ Tectonic  │
                              │ Sandbox   │
                              │ (Isolated)│
                              └───────────┘
```

---

## 🚀 Key Features

### 1. Resume Maker (LaTeX IDE)
- **Monaco LaTeX Editor**: Syntax highlighting, line numbers, code folding, smooth scrolling.
- **Shortcuts**: `Ctrl+S` / `Cmd+S` to compile and save.
- **Diagnostics**: Real-time compiler error parser extracting line numbers and messages with direct click-to-line navigation.
- **High-Performance PDF Viewer**: Zoom controls, fit width, page indicator, download PDF, and export `.tex`.

### 2. Resume Generator (Structured Wizard)
- **Admin-Approved Templates**: Curated templates ensuring optimal ATS scoring and typesetting.
- **Multi-Step Form Wizard**: Personal Information, Summary, Work Experience, Projects, Education, Skills, and Certifications.
- **Dynamic Field Arrays**: Add, remove, and manage bullet points and career entries with inline validation.
- **Open in Maker**: Export a generated LaTeX snapshot to the Maker IDE without mutating the master template.

### 3. Admin Portal
- **Operations Dashboard**: Real-time metrics on registered users, active templates, total resumes, compilation throughput, and failure rates.
- **Template Management**: Full CRUD, LaTeX source authoring, and version tracking (`v1`, `v2`, ...).
- **Live Template Tester**: Pass sample JSON to verify compilation and preview PDFs before publishing.
- **User Role Management**: Inspect accounts and toggle `USER` $\leftrightarrow$ `ADMIN` permissions.
- **Security Audit Logs**: Immutable trail with JSON metadata inspector.

### 4. Security & Compiler Sandboxing
- **FastAPI Sandbox Microservice**: Subprocess execution in ephemeral directories with strict timeout (8s), 512MB memory cap, non-root user, and `--no-shell-escape`.
- **AST Template Engine & Sanitization**: Custom parser with atomic `latexEscape()` handling all special LaTeX characters (`\`, `{`, `}`, `$`, `&`, `#`, `_`, `%`, `^`, `~`, `<`, `>`).
- **PostgreSQL Row-Level Security**: Comprehensive RLS policies enforcing tenant isolation for profiles, resumes, versions, and compilation jobs.
- **Rate Limiting**: Sliding-window rate limiter per user/IP protecting the compiler from denial-of-service attempts.

---

## 📦 Monorepo Structure

```text
resumeforge/
├── apps/
│   ├── web/                     # Next.js 15+ App Router web application
│   │   ├── app/                 # Routes: (auth), (dashboard), admin, api
│   │   ├── components/          # UI, Maker IDE, Generator, PDF Viewer, Admin, Navigation
│   │   ├── lib/                 # Supabase, Auth, LaTeX, Template Engine, Security, Rate Limiter
│   │   ├── stores/              # State management
│   │   ├── types/               # TypeScript interfaces
│   │   └── middleware.ts        # Route protection & RBAC middleware
│   │
│   └── compiler-service/        # FastAPI Isolated LaTeX Compiler Sandbox
│       ├── src/
│       │   ├── main.py          # FastAPI app & endpoints (/compile, /health)
│       │   ├── compiler.py      # Subprocess execution, timeout, memory cap, error parser
│       │   ├── sandbox.py       # Ephemeral directory context manager
│       │   ├── validators.py    # Defense-in-depth static LaTeX inspection
│       │   └── models.py        # Pydantic schemas
│       ├── Dockerfile           # Multi-stage Tectonic sandbox container
│       └── requirements.txt
│
├── packages/
│   ├── shared-types/            # Shared TypeScript interfaces & types
│   ├── template-engine/         # Safe template parser & atomic LaTeX escaping
│   └── validation/              # Zod validation schemas
│
├── supabase/
│   ├── migrations/              # Initial schema with full RLS policies & triggers
│   ├── seed.sql                 # 3 ATS-friendly production LaTeX templates
│   └── config.toml              # Supabase CLI configuration
│
├── docker-compose.yml           # Multi-service setup (web, compiler)
├── .env.example                 # Configuration template
└── package.json                 # Monorepo workspaces configuration
```

---

## 🛠️ Prerequisites

- **Node.js**: v18.0.0+ (v22+ recommended)
- **npm**: v9+
- **Python**: v3.10+ (for running compiler service directly)
- **Docker & Docker Compose**: (recommended for production deployment)

---

## ⚡ Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `apps/web/.env.local`:

```bash
cp .env.example apps/web/.env.local
```

### 3. Run the Python Compiler Service

In a separate terminal:

```bash
cd apps/compiler-service
pip install -r requirements.txt
python -m src.main
```

The compiler service will start on `http://localhost:8000`.

### 4. Run the Web Application

In the root directory:

```bash
npm run dev
```

The web application will start on `http://localhost:3000`.

---

## 🐳 Docker Deployment

Run both the Next.js frontend and the isolated LaTeX compiler sandbox inside Docker Compose:

```bash
docker-compose up --build
```

- Web App: `http://localhost:3000`
- Compiler Service: `http://localhost:8000`

---

## 🗄️ Database Setup & Supabase Migrations

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Run the migration script in `supabase/migrations/20260824000000_initial_schema.sql`.
4. Run the seed data script in `supabase/seed.sql` to populate the 3 verified ATS templates:
   - **Classic Professional**
   - **Modern Developer**
   - **Minimal ATS Executive**
5. Add your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.

---

## 🧪 Running Tests

```bash
# Run Template Engine & Security escaping tests
node --experimental-strip-types packages/template-engine/test/security.test.mjs

# Run Zod validation schema tests
node --experimental-strip-types packages/validation/test/validation.test.mjs

# Run TypeScript typecheck across all workspaces
npm run typecheck
```

---

## 🛡️ Security Verification & Best Practices

- **Sandboxed Compilation**: Subprocesses run in dedicated temporary directories cleaned up immediately after compilation.
- **LaTeX Attack Mitigation**: User inputs are strictly passed through `latexEscape()`, preventing `\write18`, `\input`, or shell injection attacks.
- **Tenant Isolation**: PostgreSQL RLS policies ensure that users can only select, insert, update, or delete their own resumes and compile jobs.
- **RBAC Server-Side Checks**: All `/api/admin/*` endpoints and `/admin/*` routes strictly verify the `ADMIN` role server-side.
