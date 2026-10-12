---
id: emergency-red-flags
title: Emergency escalation policy
category: safety
language: en
status: draft
version: 1
source_name: Requires qualified clinical review
source_url: ""
reviewed_at: null
---

# Emergency escalation policy — draft

This file is a policy placeholder, not a complete clinical triage list. Before production, have qualified clinicians define and validate the red-flag list, language variants, false-negative evaluation, and localized emergency instructions.

## Runtime behavior
- Run the deterministic red-flag check before normal LLM response generation.
- If a configured red flag is detected, show the approved emergency message and do not claim to rule out danger.
- Do not require the user to answer more questions before showing the configured urgent-care guidance.
- Do not represent this limited rule set as comprehensive.

## Approved message placeholder
"Your symptoms may need urgent medical attention. Please contact your local emergency service or go to the nearest emergency department now. If possible, ask someone nearby to help you. I can't assess an emergency safely through this chat."

Local emergency contact details must be verified for the user's location before being displayed.
