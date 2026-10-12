# Development Plan — Hackathon Build

## Delivery strategy
Build one end-to-end vertical slice first. Keep the UI polished but do not create pages that cannot complete a real workflow. No custom LLM training.

## Milestone 0 — Preflight and repository review
- Inspect current repository, package manager, runtime versions, and existing code.
- Confirm API key availability and current provider/free-tier constraints.
- Confirm deployment account and adapter.
- Create/update `PROJECT_CONTEXT.md`, PRD, architecture, safety policy, development log.
- Do not overwrite an existing project blindly.

Acceptance: documented stack, known environment, no secrets committed.

## Milestone 1 — Responsive app shell
- Astro + TypeScript + Tailwind setup or adapt existing project.
- Build landing/dashboard, responsive navigation, sample demo entry point.
- Create design tokens: white base, light blue accents, readable dark text, restrained status colors.
- Add loading, empty, error and offline/demo states.

Acceptance: mobile at 320px+ and desktop render cleanly; accessible navigation.

## Milestone 2 — Synthetic lab-report vertical slice
- Seed a clearly synthetic lab report fixture.
- Build upload interface for PDF/JPG/PNG.
- Add server-side validation and extraction API.
- Define Zod schema and validate model output.
- Add extraction states, source field display, correction/review flow.
- Add mock extraction fixture fallback.

Acceptance: fixture works end-to-end even without API; real provider path works when configured.

## Milestone 3 — Explanation and timeline
- Add deterministic reference-range comparison using the report's own ranges.
- Generate source-grounded summary from reviewed fields.
- Add timeline and a trend chart only for comparable measurements with compatible units.
- Add source details and uncertainty labels.

Acceptance: no inferred values; missing ranges stay missing; summary can be traced to evidence.

## Milestone 4 — Guided copilot and Markdown knowledge
- Add guided entry choices and state machine.
- Implement knowledge registry and simple search by topic/aliases.
- Add approved response templates.
- Add optional LLM polishing that cannot add unsupported medical facts.
- Add English/Telugu UI and one reviewed translated explanation.

Acceptance: deterministic paths make no LLM call; LLM path receives only relevant evidence; unsupported dosing request safely redirects.

## Milestone 5 — Prescription, diagnostics, discharge and wellness
- Add document-type-specific extraction schemas or discriminated union.
- Store prescriptions as written, with uncertainty and review state.
- Add manual wellness entry.
- Add document filters and timeline grouping.

Acceptance: do not merge incomparable values or normalize uncertain medication details.

## Milestone 6 — FHIR-style and demo booking
- Map records to FHIR-style resources.
- Add sample export only if validation can be completed.
- Add clearly labelled mock ABHA association and mock appointment journey.
- No claim of real ABDM/ABHA connectivity or real booking.

Acceptance: mock features cannot be mistaken for real integrations.

## Milestone 7 — Hardening and submission
- Unit tests for schemas, safety routing, range comparison and locale fallback.
- End-to-end tests for upload/review/summary/timeline.
- Test invalid file, timeout, quota failure, malformed JSON, prompt injection, missing range and low-confidence extraction.
- Inspect production build and mobile layout.
- Verify deployed URL, README, environment variable docs, architecture diagram and demo script.
- Check repository for secrets; ensure no unauthorized push.

Acceptance: all P0 requirements pass and the full demo works from a fresh session.

## Suggested time allocation (about 20 usable build hours)
- 1 h: repo/provider/deploy preflight and project docs.
- 3 h: responsive shell and synthetic demo.
- 5 h: extraction schema, API, review and correction.
- 3 h: summary and timeline.
- 2 h: knowledge files and guided copilot.
- 2 h: Telugu path and FHIR-style mapping.
- 3 h: tests, deployment, polish and failure fallback.
- 1 h: demo rehearsal and submission checks.

If time compresses: keep upload → extraction → review → explanation → timeline; defer broad document support, real auth, embeddings, real hospital search, and any real booking integration.
