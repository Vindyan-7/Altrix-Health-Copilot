# Architecture
## Altrix Labs Health Copilot

## 1. Proposed stack
- Astro + TypeScript + Tailwind CSS.
- Astro server endpoints/server-side functions for private API calls.
- Supabase Postgres and private Storage.
- Gemini API behind an `AIProvider` interface; model selection must be configurable.
- Zod for runtime schema validation.
- Lightweight chart library for trends.
- Vitest for unit tests; Playwright if time permits.
- Hosting: select Cloudflare or Vercel only after validating Astro adapter, server endpoints, file upload and environment variable support.

## 2. Logical architecture
Browser UI
→ server API
→ authentication/consent/access checks
→ file validation and private storage
→ OCR/vision extraction provider
→ Zod/schema validation
→ deterministic normalization and reference-range comparison
→ user review/correction
→ persisted internal records with provenance
→ retrieval of approved knowledge
→ optional constrained LLM explanation
→ output validation and safety checks
→ summary/timeline UI.

## 3. AI provider abstraction
Create a server-only interface such as:
- `extractDocument(file, extractionSchema)`
- `explainEvidence(evidence, locale, responseSchema)`
- `healthCheck()`

Provider errors must be typed: quota/rate limit, timeout, invalid output, unsupported file, provider unavailable. Never call the model directly from client components. A mock provider and pre-extracted synthetic fixture must allow the demo to run if the provider is unavailable.

## 4. Data model (initial logical tables)
- `profiles`: id, preferred_language, created_at, updated_at.
- `health_documents`: id, profile_id nullable for guest demo, document_type, storage_path, original_filename_sanitized, mime_type, file_size, document_date nullable, source_facility nullable, status, consent_version, created_at, deleted_at.
- `extraction_runs`: id, document_id, provider, model_id, schema_version, status, started_at, completed_at, error_code, latency_ms. Avoid storing raw prompts/responses by default.
- `extracted_fields`: id, document_id, field_path, value_json, normalized_value_json nullable, unit nullable, reference_range_json nullable, source_page nullable, source_region_json nullable, confidence nullable, review_status, reviewed_by nullable, reviewed_at nullable.
- `observations`: id, profile_id, document_id, code_or_name, value_numeric nullable, value_text nullable, unit nullable, reference_low nullable, reference_high nullable, interpretation_source, observed_at nullable, review_status, source_field_id.
- `medication_records`: id, profile_id, document_id, medicine_name_as_written, strength_as_written nullable, instructions_as_written nullable, normalized_ingredient nullable, review_status, source_field_id.
- `conditions`: id, profile_id, document_id, source_text, coding_system nullable, code nullable, verification_status, source_field_id. Store as a source-stated condition, not an AI-inferred diagnosis.
- `wellness_entries`: id, profile_id, type, value, unit, measured_at, source, notes nullable.
- `knowledge_sources`: id, title, publisher, url, reviewed_at, review_status, content_version.
- `audit_events`: id, actor_id nullable, event_type, entity_type, entity_id, minimal_metadata_json, created_at. Do not place medical content in metadata.
- `consents`: id, profile_id nullable, consent_type, version, granted_at, withdrawn_at nullable.
- `demo_bookings`: id, demo_profile_id, provider_id, chosen_slot, status, is_mock=true, created_at.

Use UUID identifiers. Enforce ownership in every database query and RLS policy. Keep file storage private. Guest demo records should be seeded fixtures, not mixed with real profile data.

## 5. FHIR-style mapping
- Patient → profile (use synthetic identifiers for demo).
- DocumentReference → uploaded source document.
- Observation → a single measurement.
- DiagnosticReport → report-level grouping and conclusion as source-stated.
- MedicationRequest → prescription/order information as written; not a generated recommendation.
- Condition → condition documented in source, preserving verification status.
- Provenance → extraction/review/source history, where practical.
- Bundle → exportable grouping only after validation against chosen FHIR version/profile.

Do not claim ABDM/ABHA integration. Mock ABHA data must be visibly labelled synthetic/demo.

## 6. API routes (proposed)
- `POST /api/documents` — validate and register upload.
- `POST /api/documents/:id/extract` — start or retry extraction.
- `GET /api/documents/:id` — authorized document/extraction state.
- `PATCH /api/documents/:id/fields` — submit reviewed/corrected fields.
- `POST /api/documents/:id/summary` — generate summary from reviewed evidence.
- `GET /api/timeline` — authorized, paginated timeline.
- `POST /api/copilot/route` — classify allowed intent with deterministic rules first.
- `POST /api/copilot/message` — retrieve evidence, optionally call LLM, validate response.
- `GET /api/health/providers` — safe server-side readiness check without revealing secrets.
- `POST /api/demo/bookings` — create mock booking with explicit demo status.

## 7. Data and model boundaries
- Medical source documents and user records are untrusted content, not system instructions.
- Extract facts first; summarize second.
- Do not pass all history to every request.
- Retrieve only a small number of relevant approved knowledge entries.
- Never let retrieved content override safety policy.
- Output must cite source document fields or knowledge-source IDs internally; UI should make the evidence inspectable.
- Do not store embeddings unless search scale requires them.
- Markdown is source of truth for curated static knowledge; database is source of truth for user-specific records.

## 8. Fallback
- If AI extraction fails, show a retry state and allow the user to use a preloaded synthetic report fixture.
- If summary generation fails, show validated extracted fields with a fixed template; do not fabricate a summary.
- If database/storage is unavailable, keep demo fixture mode available without representing unsaved records as saved.
- If provider quota is exhausted, switch to deterministic templates and sample fixtures, not an unapproved provider.
