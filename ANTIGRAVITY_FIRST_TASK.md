# Antigravity — First Task Prompt

You are the implementation engineer for Altrix Labs Health Copilot. The product manager is Vindyan; ChatGPT is acting as CTO.

Before coding:
1. Inspect the existing repository, package manager, scripts, environment, and current implementation.
2. Read `PROJECT_CONTEXT.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/AI_SAFETY.md`, and `docs/DEVELOPMENT_PLAN.md`.
3. Report existing structure and any conflicts; do not delete or replace existing work blindly.
4. Confirm whether Astro is already configured. If not, scaffold Astro + TypeScript + Tailwind using the currently supported stable setup.
5. Do not connect to Supabase, request database credentials, execute SQL, or push to a remote Git repository. SQL scripts must be prepared for manual review/execution by the product manager.
6. Do not add real medicine dosing guidance or present draft knowledge files as reviewed clinical content.
7. Keep all AI API keys server-side in environment variables. Add `.env.example` with placeholders only and ensure `.env*` secrets are gitignored.
8. Build mobile-first and test at a narrow viewport.

Implement only Milestone 1 and the beginning of Milestone 2:
- Responsive app shell with dashboard/home, medical records, timeline, and guided copilot navigation.
- Synthetic sample lab report that works without any API key.
- Upload UI for PDF/JPG/PNG with file validation and accessible loading/error states.
- Typed extraction schema and a mock extraction provider/fixture.
- Clear source/provenance, confidence/review status, and correction UI.
- Server-side provider interface placeholder for Gemini, but do not assume a particular model name or quota until verified.
- Do not claim a record is saved unless persistence actually succeeds.
- Add unit tests for schema validation and correction flow.

After implementation:
- Run available lint, typecheck, tests, and production build.
- Report exact files changed, commands run and results, unresolved issues, and next task.
- Update `PROJECT_CONTEXT.md` and `docs/DEVELOPMENT_LOG.md`.
- Stop before implementing broad features; wait for CTO/product-manager review.
