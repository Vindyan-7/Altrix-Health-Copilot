# Product Requirements Document (PRD)
## Altrix Labs — AI-Powered Personal Health Copilot
**Status:** Draft v1.0 for Product Manager approval  
**Product owner:** Vindyan  
**CTO:** ChatGPT  
**Developer:** Antigravity

## 1. Product vision
Help people understand and organize their healthcare information by turning medical records into traceable, plain-language explanations and a unified health history, supported by a friendly, guided assistant.

**Positioning:** Understand your health records. Know what questions to ask. Take your next step with confidence.

## 2. Problem
Healthcare information is fragmented across lab reports, prescriptions, diagnostic reports, discharge summaries, and personal wellness logs. People may struggle to understand terminology, compare results over time, or prepare useful questions for a clinician.

## 3. Goals
1. Demonstrate document upload, extraction, validation, user correction, plain-language summary, and timeline.
2. Preserve source provenance for extracted fields and explanations.
3. Provide guided English and Telugu UX.
4. Keep medical knowledge curated in Markdown and minimize unnecessary model calls.
5. Show FHIR-style data modelling and a clearly labelled mock ABHA association.
6. Provide safe, friendly health education without diagnosis or prescribing.
7. Deliver a responsive, deployed prototype and judge-ready walkthrough.

## 4. Non-goals for the hackathon
- Diagnosing conditions or predicting an individual's disease.
- Prescribing medicines or creating individualized dosage instructions.
- Telling a user to start, stop, change, or combine medicines.
- Replacing a clinician, pharmacist, emergency service, or official medical record.
- Real ABHA authentication, ABDM data exchange, or claims of ABDM certification.
- Real hospital appointment booking unless an authorized, working integration is available and tested.
- Building or fine-tuning a dedicated LLM.
- Supporting every language, every handwriting style, or every document layout.
- Using real identifiable patient records in the demo.

## 5. Target users
Broad public audience. Because "everyone" can include minors and people with different accessibility needs, the prototype must not assume adult status or offer individualized clinical advice. Initial demo dataset should use synthetic adult profiles. A production launch requires a specific target population, accessibility review, consent design, and legal/clinical review.

## 6. Product principles
- Evidence before eloquence.
- Unknown values stay unknown; never silently guess.
- Friendly and non-judgmental language.
- No numeric "health score" that implies diagnosis or validated risk.
- Clear separation between source facts, deterministic flags, and AI-generated explanations.
- Explain uncertainty and show where information came from.
- User reviews extracted data before it is treated as confirmed.
- Safety routing must not depend only on a generative model.
- Location and medical-document access are requested only when needed.
- Minimal data collection and retention.

## 7. Primary user journeys
### Journey A — Guest demo
1. User lands on a responsive homepage.
2. User opens a synthetic sample report or starts a guided demo.
3. App shows extracted fields, source references, units, and confidence/review status.
4. User reviews/corrects extracted values.
5. App produces a plain-language explanation grounded in the source and curated knowledge.
6. User sees the report in a chronological timeline and an example trend for comparable measurements.

### Journey B — Personal document
1. User sees concise privacy/consent information.
2. User uploads a supported file (PDF, JPG, PNG; limits configured).
3. Server validates type/size and creates a private processing record.
4. OCR/vision extraction returns schema-constrained JSON.
5. Server validates fields, units, dates, and provenance.
6. User reviews uncertain values; unresolved fields remain marked unknown.
7. User confirms before saving to their profile.
8. Summary and timeline display source attribution and limitations.

### Journey C — Guided health copilot
1. User selects: My reports, Medicine information, A health concern, My health history, or Find healthcare.
2. A deterministic router handles simple navigation and known lookups without an LLM.
3. A reviewed response template or curated knowledge entry answers simple educational questions.
4. Only when language synthesis is useful does the app call the LLM with the minimum relevant evidence.
5. Output is checked for schema, unsupported claims, safety and source references.
6. User can ask a relevant follow-up or be directed to professional care.

### Journey D — Nearby care / mock booking
1. User explicitly asks to find nearby care.
2. App asks permission for location or accepts manual city/PIN.
3. Only verified directory/search results may be displayed, with source and checked timestamp where possible.
4. Mock appointment flow is labelled "Demo only — not a real booking."
5. No booking confirmation is claimed unless an actual partner integration confirms it.

## 8. Functional requirements
### P0 — mandatory core
- Responsive layout and accessible navigation.
- Guest mode with synthetic sample data.
- Upload supported PDF/image files.
- Server-side OCR/vision extraction with schema validation.
- Extraction fields: document type, dates, test names/values/units/reference ranges, medicine names/strength/instructions as written, and source-stated diagnoses/findings.
- Field-level provenance and uncertainty/review status.
- User correction and confirmation.
- Plain-language summary grounded in the uploaded record.
- Chronological health timeline.
- Safe empty, loading, error, timeout, and retry states.
- Server-side secrets only.
- Synthetic end-to-end test data.
- Deployment and working links before submission.

### P1 — high value
- Guided copilot menu and response templates.
- English/Telugu interface and summaries for selected flows.
- Deterministic flagging based on report-provided reference ranges.
- Trend chart for repeated comparable tests with units and dates.
- FHIR-style internal mapping and downloadable sample FHIR Bundle if valid.
- Mock ABHA identifier/link clearly marked as non-functional demo data.
- Mock booking journey clearly marked as non-functional.

### P2 — only after P0/P1 stable
- Broader knowledge-base search and indexing.
- Wellness logs entry and visualization.
- Additional document types/layouts.
- Read-aloud and broader language support.
- Verified nearby-care discovery integration.
- Real hospital booking after partner authorization and API verification.

## 9. Non-functional requirements
- Mobile-first, usable at 320px viewport width without horizontal page scrolling.
- Keyboard-accessible core flows and visible focus states.
- TypeScript strict mode; validated request/response schemas.
- File size/type limits; no public bucket for personal documents.
- All model/API calls server-side.
- Explicit timeouts, bounded retries, and rate limits.
- Avoid logging raw medical text, prompts containing PHI, or original file contents.
- Consistent error states and actionable user messages.
- Automated unit tests for validators, safety router, and range comparisons.
- End-to-end test of the complete synthetic report journey.
- Deployment smoke test and README with setup instructions.

## 10. Safety and medical boundaries
Allowed:
- Explain terminology and values as shown in a report.
- Explain general, sourced medicine information.
- Restate a prescription exactly as written while flagging unclear instructions.
- Suggest questions to ask a clinician.
- Encourage professional evaluation where appropriate.
- Provide conservative emergency guidance based on clinically reviewed rules.

Not allowed:
- Diagnose or rule out a disease.
- Prescribe, personalize doses, or recommend starting/stopping/changing medication.
- Tell users that symptoms are definitely harmless.
- Infer a diagnosis from a lab value alone.
- invent missing values, reference ranges, units, medication instructions, or citations.
- Present a mock hospital/booking as real.
- Claim that an LLM output is clinically validated.

Potentially urgent symptoms trigger a conservative safety flow before normal chat. Rules must be clinically reviewed before production; the hackathon prototype must state that its safety rules are not comprehensive.

## 11. Success criteria
- At least one synthetic lab report completes upload → extraction → correction/review → explanation → timeline.
- At least one prescription sample extracts instructions as written without inventing missing details.
- Required fields and source provenance visible in the UI.
- Extraction evaluation reports exact-match/field accuracy on a labelled test set.
- English and Telugu demonstrated in at least one core path.
- Safety test suite includes unsupported dosage request, emergency-like input, missing reference range, prompt injection in a document, and model timeout.
- No secret in client bundle or repository.
- Deployed link, README, architecture diagram, and demo script available.

## 12. Open decisions requiring approval
- Exact hosting provider and account availability.
- Current Gemini model and free-tier availability at build time.
- Max upload size and retention period.
- Whether authentication is implemented in the hackathon or deferred after guest demo.
- Exact FHIR version/profiles and validation approach.
- Clinical reviewer for any medical content used beyond clearly sourced educational material.
- Whether any hospital directory integration can be legally and technically verified.
