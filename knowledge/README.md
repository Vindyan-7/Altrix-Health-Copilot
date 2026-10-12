# Curated Knowledge Base

## Governance
Markdown is the reviewed source of truth for static health education, safety policy, and response templates. User-specific medical records live in the database, not in these files.

## Before an entry can be used in user-facing answers
- Include a credible source and direct URL.
- Record retrieval/review date and version.
- Mark status `draft`, `reviewed`, or `retired`.
- Keep claims within the source's scope.
- Do not create individualized dosing or treatment advice.
- A model must not turn draft content into authoritative advice.
- For real deployment, obtain qualified clinical review and legal/privacy review.

## Suggested front matter
---
id: example-topic
title: Example topic
category: health-topic
language: en
status: draft
version: 1
source_name: ""
source_url: ""
source_published_at: null
reviewed_at: null
reviewed_by: null
last_verified_at: null
intended_use: general education
limitations:
  - Not for diagnosis or individualized treatment
---

## Retrieval strategy
1. Deterministic intent route.
2. Exact alias/topic lookup.
3. Return approved static template when adequate.
4. Retrieve only the most relevant approved entries.
5. Call an LLM only when it adds value in wording or explanation.
6. Validate the response against the retrieved evidence and safety policy.
7. If evidence is absent or ambiguous, say so and route to professional care where appropriate.

## No-LLM cases
- Navigation and guided option transitions.
- Showing a source passage verbatim or with a fixed template.
- Displaying stored extraction fields.
- Deterministic reference-range comparisons when a report supplies the range.
- Safety messages reviewed and approved in advance.
