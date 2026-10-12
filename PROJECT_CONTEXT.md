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
Iteration 2B & Review Workflow Integrity Fix completed; Checkpoint 3 established on branch `develop` (base commit `9eff6ec` + docs commit `6f6380a`):
- **Current Baseline:** `develop` is synchronized with `origin/develop` and preserves all prior feature branches.
- **Approved Extraction Contract Rules:**
  1. **Explicit Identity:** Documents must explicitly report `isSyntheticDemo: false` for real extractions; synthetic fixtures remain `isSyntheticDemo: true`.
  2. **Confidence vs Optical Uncertainty:** `confidence` (0 to 1 score) is distinct from `isUncertain` (boolean flag for degraded print/faint ink/smudges).
  3. **Uncertainty vs Review Status:** Optical uncertainty flags are strictly separated from user `reviewStatus` (`unreviewed`, `confirmed`, `corrected`). User review does NOT erase optical warnings.
  4. **Source Provenance Integrity:** Every extracted field must link to `rawSnippet`, `page`, and relative bounding box coordinates (`0-100%`). OCR must never fabricate missing provenance.
  5. **No Invented Reference Ranges:** If a lab report omits reference intervals, `referenceRange` is omitted/null and interpretation evaluates to `unspecified`. OCR must never infer biological normalcy without source ranges.
  6. **Typed Errors & No Silent Fallbacks:** Real extraction failures (quota, timeout, invalid format) throw typed `AIProviderError` with structured status codes. Silent substitution of synthetic fixtures is strictly prohibited.
- **Server Runtime Status:** Current Astro config remains static (`output: 'static'`). Static builds alone cannot host the dynamic `POST /api/documents/extract` endpoint in production without a server adapter. Adapter selection is deferred until the deployment target is confirmed.
- **Quality Gates:** 19/19 Vitest unit tests pass, TypeScript strict mode passes (`tsc --noEmit`), and production build passes cleanly.

## Current next task
Await CTO (ChatGPT) and Product Manager (Vindyan) sign-off on the proposed TypeScript/Zod contract diff before editing shared files or branching into `feat/timeline-iteration-3`.






