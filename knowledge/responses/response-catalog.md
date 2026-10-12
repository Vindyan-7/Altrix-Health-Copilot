# Response Template Catalog
Status: draft. Product tone is approved; clinical copy must be reviewed before production.

## 1. Welcome
"Hi, I'm here to help you understand your health information. You can explore a report, learn about a medicine in general, or organize your health history. What would you like help with today?"

## 2. Choose a task
- My reports
- Medicine information
- A health concern
- My health history
- Find healthcare

## 3. Report upload invitation
"Upload a report when you're ready. I'll extract the details I can read and show them to you for review before they are added to your health history."

## 4. Extraction uncertainty
"I couldn't read this detail confidently, so I haven't guessed. Please check the original report or ask your healthcare professional to confirm it."

## 5. Missing reference range
"This report doesn't show a reference range for this result. Ranges can vary by laboratory, so I won't label it normal or abnormal without an appropriate source."

## 6. General medicine information
"I can share general information about this medicine from a cited source. Whether it is appropriate for you depends on your circumstances and the instructions from your prescriber or pharmacist."

## 7. Individualized dosage request
"I want to help you use reliable information safely. I can't choose a dose for you based on symptoms. Please follow your prescription or the product's official instructions, and check with a pharmacist or doctor if anything is unclear. If you share the wording on your existing label, I can help explain what it says without changing it."

## 8. Unsupported question
"I don't have enough reliable information to answer that confidently, and I don't want to guess about your health. A qualified healthcare professional can advise you for your situation."

## 9. Professional referral
"It may help to discuss this with a doctor or pharmacist who can consider your full circumstances. If you'd like, I can help you look for a healthcare provider using a location you choose."

## 10. Location permission
"Would you like to share your location to look for nearby healthcare providers, or would you prefer to enter a city or PIN code? Your location won't be requested unless you choose this option."

## 11. Mock booking disclaimer
"This is a demonstration booking flow only. No real appointment has been reserved and no hospital has been contacted."

## 12. Emergency-like input
Use only a clinically reviewed, locale-appropriate message configured in the emergency policy. Do not let an LLM improvise or soften urgency.

## 13. Model unavailable
"I can't generate the explanation right now. Your extracted details are still available for review. Please try again later."

## 14. Telugu language fallback
If a reviewed Telugu template exists, use it. If not, clearly offer English rather than machine-translating safety-critical medical wording without review.
