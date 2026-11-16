# SAPA AYAH — AI AGENT PROJECT RULES

## 1. Project Identity
- **Project:** SAPA Ayah Digital Platform
- **Organization:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah
- **Purpose:** Integrated Foundation Management and Learning Platform.

## 2. Technology Stack
- Next.js App Router
- TypeScript (Strict Mode)
- Tailwind CSS
- shadcn/ui
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Row Level Security (RLS)
- Vercel Deployment
- GitHub Version Control

## 3. Documentation Priority
Before implementation, always read:
- `docs/master-blueprint.md`
- `docs/srs.md`
- `docs/business-process.md`
- `docs/rbac-matrix.md`
- `docs/database-design.md`
- `docs/security-policy.md`
- `docs/roadmap.md`
- `docs/architecture.md`
- `docs/implementation-plan.md`
- `docs/technical-decisions.md`
- `docs/development-status.md`
- `docs/risk-register.md`

Never invent business requirements.  
If documentation conflicts, report the conflict immediately.  
If information is missing, request clarification.

## 4. Development Rules
- Use TypeScript strictly (`noImplicitAny`, strict null checks).
- Prefer reusable components.
- Use React Server Components by default.
- Use Client Components only when necessary for interactivity.
- Separate UI, business logic, and data access.
- Follow modular architecture (`src/app`, `src/components`, `src/features`, `src/lib`).
- Avoid duplicated code.
- Use database migrations (`supabase/migrations/`).
- Never modify production data during testing.

## 5. Security Rules
- Never expose Supabase service role keys (`SUPABASE_SERVICE_ROLE_KEY` must never be in client code or prefixed with `NEXT_PUBLIC_`).
- Never trust frontend role checks alone.
- Enforce authorization on the server (Server Actions & Route Handlers).
- Implement RLS on all protected tables in the `public` schema.
- Validate all user inputs using Zod schemas.
- Protect uploaded files: private buckets for proofs/documents, accessible only via time-limited signed URLs.
- Record sensitive administrative actions in `audit_logs`.
- Never bypass permission checks.

## 6. Design Rules
Use SAPA Ayah branding palette:
- **Primary Blue:** `#547F9F`
- **Deep Blue:** `#385A75`
- **Soft Blue:** `#E8F0F5`
- **Background:** `#F5F7F8`
- **Dark Text:** `#252D35`
- **White / Card Surface:** `#FFFFFF`

Design must be:
- Modern
- Minimalist
- Human-centered & warm
- Responsive (Mobile-First)
- Consistent
- Accessible (WCAG 2.1 AA)

## 7. Execution Rules
- Work phase by phase according to `docs/implementation-plan.md`.
- Prepare implementation plans before coding.
- Do not implement unrelated features.
- Do not skip tests.
- Do not silently change architecture.
- Do not delete existing working features without approval.
- Keep documentation updated.
- **DO NOT** implement a payment gateway for the MVP.
- **DO NOT** deploy to production without approval.
- **STOP** after completing a phase and wait for checkpoint approval.

## 8. Completion Report
At the end of each task, report:
1. Completed work.
2. Files created or modified.
3. Database changes.
4. Tests performed.
5. Test results.
6. Known issues.
7. Security considerations.
8. Recommended next task.

Do not claim a task is complete if it has not been tested.
