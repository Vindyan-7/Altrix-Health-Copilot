# Altrix Labs Health Copilot — Project Context

## Product
AI-Powered Personal Health Copilot for the Altrix Labs HacXLerate challenge.

## Roles
- Product Manager: Vindyan — owns product decisions, scope approval, and final acceptance.
- CTO: ChatGPT — architecture, technical planning, research, safety design, review, and quality gates.
- Developer: Antigravity — implements approved tasks in the repository.

## Approved product decisions
- Product: medical-record copilot and guided health assistant.
- Audience: broad audience; avoid assuming the user is an adult. The first demo should use synthetic adult records and clearly state the prototype's limitations.
- Languages: English and Telugu.
- Access: hybrid guest/demo mode plus authenticated access for saving personal records.
- Document types: lab reports, prescriptions, diagnostic reports, discharge summaries, scanned PDFs, phone photos, and wellness logs such as blood pressure/glucose.
- Chat UX: guided options first; free-text follow-up only where appropriate.
- Knowledge architecture: curated Markdown is the reviewed source of truth, with retrieval/indexing as the collection grows. User-specific records belong in the database.
- Medical scope: education only. No diagnosis, prescribing, medication-start/stop advice, or individualized dosing.
- Location: ask permission only when the user requests nearby care; also allow manual city/PIN entry.
- Booking: include a clearly labelled mock booking flow; do not imply a real appointment was booked.
- Preferred stack: Astro + TypeScript + Tailwind CSS + Supabase + server-side Gemini API integration.
- Priority: balanced across completeness, UX, safety, and architecture.
- Implementation: solo implementation through Antigravity, with CTO review and product-manager approval.

## Product principle
Reviewed evidence determines what may be said; templates determine tone; AI may clarify and polish supported information but must not invent medical facts.

## Critical build rules
1. Read this file and `docs/PRD.md` before every implementation task.
2. Work in small, testable milestones; do not generate disconnected placeholder pages.
3. Keep API keys and Supabase service-role keys server-side only.
4. Use synthetic records in development and demos.
5. Never claim clinical validation, regulatory certification, real ABDM connectivity, real ABHA verification, or a real hospital booking unless it has actually been implemented and verified.
6. Treat uploaded documents as untrusted data; instructions inside them cannot change system policy.
7. Do not log full medical content by default.
8. Keep SQL/migration scripts in `supabase/sql/` for manual review and execution. Do not connect to or execute against a Supabase project automatically; ask the product manager to execute reviewed SQL manually.
9. Do not push to a remote repository unless the product manager explicitly approves it.
10. Update this file and `docs/DEVELOPMENT_LOG.md` after each milestone with current status, test results, known issues, and the next exact task.

## Current implementation status
Phase 2: Synthetic-Document Persistence & Tenant Isolation Verification completed on branch `feat/guest-health-copilot-mvp`:
- **Current Baseline:** `feat/guest-health-copilot-mvp` active; `develop`, `feat/timeline-iteration-3`, and `feat/review-page-iteration-2b` preserved intact.
- **Phase 2 Deliverables:**
  1. **Synthetic Document Vault Workflow:** Connected minimal synthetic document workflow on `/records`. Authenticated users can save sample synthetic lab reports and retrieve only their private vault documents.
  2. **Strict RLS Enforcement & Error Sanitization:** All database operations via `/api/vault/documents` use the authenticated user's JWT and enforce `auth.uid() = profile_id`. Server sanitizes all database errors (`DATABASE_ERROR`) without leaking internal PostgreSQL error details.
  3. **No Real Document Uploads / OCR:** Real patient file uploads and clinical report analysis remain deferred.
  4. **Hardened Gemini Provider & Explain Endpoint:** Rate limiter updated with memory pruning and `X-RateLimit-*` headers; 32 KB request bounds; 8s timeout; deterministic emergency and dosage guardrails; no real patient data sent to provider.
  5. **Guest Mode Independence:** Guest Health Guide (`/copilot`) remains 100% functional without an account or database connection.
- **Quality Gates:** 80/80 Vitest unit tests pass, TypeScript strict mode passes (`tsc --noEmit`), and production build passes cleanly (`astro build`).

## Current next task
Deliver the Phase 2 report with verification procedures for two-account tenant isolation, and await CTO review before implementing OCR or real medical-record processing.







