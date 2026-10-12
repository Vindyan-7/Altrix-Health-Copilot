# AI-Powered Personal Health Copilot — Flow-Based Chatbot Specification

## Purpose

Implement a predictable, flow-based chatbot for the AI-Powered Personal Health Copilot. The chatbot uses **40 predefined scenarios** with hardcoded demo responses and guided follow-up questions. It is intended for a hackathon prototype and health-information navigation—not for diagnosing conditions or prescribing treatment.

The chatbot should feel conversational, but its first version can use deterministic intent matching and scenario data rather than a live LLM. Responses must be honest about the fact that this is a demo flow.

## Product requirements

- Provide a chat interface with user and assistant message bubbles.
- Match user messages to one of the 40 scenarios using normalized keywords, phrases, and simple intent rules.
- Support suggested prompts/quick-reply buttons.
- Ask clarifying questions when an input could match multiple scenarios.
- Use the same scenario response consistently for the same intent.
- Allow users to restart the conversation and return to the main topics.
- Include a “not sure / other question” fallback.
- Never state that the bot has diagnosed a user.
- Do not recommend prescription medication, a specific dose, or changing prescribed treatment.
- For possible emergencies, prioritize urgent professional care rather than continuing a routine flow.
- Do not ask users to provide unnecessary personal identifiers.
- Make clear that scenario answers are predefined demo content and not a substitute for a clinician.

## Suggested conversation engine

1. Normalize input: lowercase, trim whitespace, remove punctuation, collapse repeated spaces.
2. Check emergency red-flag phrases first.
3. Match exact phrase and keyword rules for the 40 scenarios.
4. If multiple scenarios match, ask the user to choose the intended topic.
5. Return the scenario's predefined response and quick replies.
6. If a follow-up option is selected, continue along that scenario's flow.
7. If no rule matches, return the fallback response and show topic suggestions.

**Important:** keyword matching is a prototype technique, not reliable medical natural-language understanding. Do not use this as a production triage system.

## Scenario data contract

Represent each scenario in code as an object like this:

```ts
type ChatScenario = {
  id: string;
  title: string;
  triggers: string[];
  keywords: string[];
  response: string;
  quickReplies: string[];
  safetyLevel: "routine" | "caution" | "urgent";
  disclaimer?: string;
};
```

Recommended additional fields for branching flows:

```ts
type ChatFlowNode = {
  id: string;
  message: string;
  options?: Array<{
    label: string;
    nextNodeId?: string;
    response?: string;
    safetyLevel?: "routine" | "caution" | "urgent";
  }>;
};
```

Store these in a dedicated file such as `src/data/healthChatScenarios.ts`. Keep chatbot UI, matching logic, scenario content, and safety rules separate.

---

# The 40 predefined scenarios

The responses below are example demo content. They are deliberately conservative and should be reviewed against current, locally appropriate clinical guidance before release.

## Scenario 01 — Fever

**Example user input:** “I have a fever.”

**Triggers / keywords:** `fever`, `temperature`, `high temperature`, `feeling feverish`, `body is hot`

**Predefined response:**

“I’m sorry you’re feeling unwell. I can help you find general information, but I can’t diagnose the cause of a fever. If you can, measure your temperature and note when it started and any other symptoms. Seek urgent medical help if you have trouble breathing, confusion, a seizure, a stiff neck with severe headache, or another rapidly worsening symptom. Would you like help organizing your symptoms or learning when to contact a clinician?”

**Quick replies:** `How long should I monitor it?` · `Other symptoms` · `Urgent warning signs`

**Flow:** Ask when it started and whether there are severe symptoms. Do not infer a cause or recommend a drug/dose.

## Scenario 02 — Headache

**Example user input:** “I have a headache.”

**Triggers / keywords:** `headache`, `head pain`, `my head hurts`

**Predefined response:**

“Headaches can have many causes. Note when it began, how severe it is, and whether it is different from headaches you have had before. A sudden, extremely severe headache, or headache with weakness, confusion, fainting, fever and stiff neck, or a recent serious head injury needs urgent medical assessment.”

**Quick replies:** `Describe the headache` · `Warning signs` · `Contact a clinician`

## Scenario 03 — Cough

**Example user input:** “I have a cough.”

**Triggers / keywords:** `cough`, `coughing`, `dry cough`, `wet cough`

**Predefined response:**

“A cough can occur for several reasons, and this chat cannot determine the cause. Note how long it has lasted and whether you have fever, breathlessness, chest pain, or blood when coughing. Seek urgent care for severe breathing difficulty, blue or grey lips, or significant coughing of blood.”

**Quick replies:** `Cough duration` · `Other symptoms` · `Warning signs`

## Scenario 04 — Sore throat

**Example user input:** “My throat hurts.”

**Triggers / keywords:** `sore throat`, `throat pain`, `pain swallowing`, `throat hurts`

**Predefined response:**

“A sore throat can have different causes. Keep track of its duration and associated symptoms. Trouble breathing, inability to swallow saliva, or rapidly increasing swelling requires urgent medical attention. A clinician can assess persistent or worsening symptoms.”

**Quick replies:** `Difficulty swallowing` · `How long has it lasted?` · `Warning signs`

## Scenario 05 — Runny or blocked nose

**Example user input:** “My nose is blocked.”

**Triggers / keywords:** `blocked nose`, `stuffy nose`, `runny nose`, `sneezing`, `nasal congestion`

**Predefined response:**

“A blocked or runny nose may occur with a cold, allergies, or other conditions. I can’t identify the cause from this message alone. Note how long it has lasted and whether you have fever, facial pain, or breathing problems. Seek professional advice if symptoms are severe or persistent.”

**Quick replies:** `Sneezing and itchy eyes` · `Fever too` · `Contact a clinician`

## Scenario 06 — Nausea or vomiting

**Example user input:** “I feel like vomiting.”

**Triggers / keywords:** `nausea`, `vomiting`, `throwing up`, `feel sick`

**Predefined response:**

“Nausea and vomiting can have many causes. If you can tolerate fluids, small frequent sips may help while you monitor how you feel. Seek urgent care if you cannot keep fluids down, faint, become confused, have severe abdominal pain, vomit blood, or show signs of severe dehydration.”

**Quick replies:** `I cannot keep fluids down` · `Abdominal pain` · `Other symptoms`

## Scenario 07 — Diarrhea

**Example user input:** “I have diarrhea.”

**Triggers / keywords:** `diarrhea`, `loose stools`, `frequent watery stool`

**Predefined response:**

“Diarrhea can lead to dehydration. If you can drink safely, replace lost fluids using an appropriate oral rehydration solution according to its instructions. Seek medical advice for blood in stool, severe pain, persistent vomiting, signs of dehydration, or symptoms that are severe or prolonged.”

**Quick replies:** `Signs of dehydration` · `Blood in stool` · `Contact a clinician`

## Scenario 08 — Constipation

**Example user input:** “I am constipated.”

**Triggers / keywords:** `constipation`, `hard stools`, `difficulty passing stool`, `cannot poop`

**Predefined response:**

“Constipation can be related to diet, fluids, activity, medicines, or other conditions. Note how long it has been happening and whether your bowel habits have changed. Severe abdominal pain, vomiting, marked swelling, or inability to pass gas with constipation needs urgent assessment.”

**Quick replies:** `How long has it lasted?` · `Severe abdominal pain` · `General information`

## Scenario 09 — Abdominal pain

**Example user input:** “My stomach hurts.”

**Triggers / keywords:** `stomach pain`, `abdominal pain`, `belly hurts`, `stomach ache`

**Predefined response:**

“Abdominal pain has many possible causes. Its location, severity, onset, and associated symptoms matter. Seek urgent medical assessment for severe or sudden pain, a rigid or very swollen abdomen, fainting, blood in vomit or stool, or pain with possible pregnancy. Do not rely on this chatbot to determine the cause.”

**Quick replies:** `Pain location` · `Sudden or severe pain` · `Contact a clinician`

## Scenario 10 — Heartburn or indigestion

**Example user input:** “I have heartburn.”

**Triggers / keywords:** `heartburn`, `indigestion`, `acid reflux`, `burning chest after food`

**Predefined response:**

“Heartburn can cause a burning feeling after meals, but chest discomfort is not always caused by acid reflux. New or unexplained chest pressure, especially with breathlessness, sweating, nausea, or pain spreading to the arm, back, or jaw, requires emergency medical assessment.”

**Quick replies:** `Explain common triggers` · `Chest discomfort warning signs` · `Contact a clinician`

## Scenario 11 — Dizziness

**Example user input:** “I feel dizzy.”

**Triggers / keywords:** `dizzy`, `dizziness`, `lightheaded`, `room spinning`, `vertigo`

**Predefined response:**

“Dizziness can have several causes. Sit or lie somewhere safe and avoid driving while dizzy. Seek emergency help if it begins suddenly with weakness, facial droop, difficulty speaking, severe headache, fainting, chest pain, or difficulty walking.”

**Quick replies:** `Spinning or lightheaded?` · `Warning signs` · `Contact a clinician`

## Scenario 12 — Fatigue

**Example user input:** “I feel tired all the time.”

**Triggers / keywords:** `fatigue`, `tired all the time`, `low energy`, `exhausted`

**Predefined response:**

“Persistent fatigue can be associated with sleep, stress, medicines, anemia, thyroid problems, and many other factors. This message alone cannot identify the cause. Track how long it has lasted, sleep patterns, and related symptoms, and arrange a clinical review if it persists or affects daily activities.”

**Quick replies:** `Sleep concerns` · `Review my lab report` · `Contact a clinician`

## Scenario 13 — Difficulty sleeping

**Example user input:** “I cannot sleep.”

**Triggers / keywords:** `insomnia`, `cannot sleep`, `trouble sleeping`, `poor sleep`

**Predefined response:**

“Sleep difficulty can have many causes. A regular sleep and wake time, a relaxing wind-down routine, and reducing late-day caffeine may help some people. If the problem persists or significantly affects daily life, consider a healthcare professional's assessment. Do not start sleep medication based on this chatbot.”

**Quick replies:** `Sleep routine` · `Daytime tiredness` · `Contact a clinician`

## Scenario 14 — Skin rash

**Example user input:** “I have a rash.”

**Triggers / keywords:** `rash`, `skin irritation`, `itchy skin`, `red patches`

**Predefined response:**

“A rash can result from irritation, allergy, infection, or other causes. Note when it started and any new products or medicines. A rash with breathing difficulty or swelling of the tongue or throat is an emergency. A rapidly spreading rash, fever, severe pain, or blistering needs prompt medical assessment.”

**Quick replies:** `When did it start?` · `Possible emergency signs` · `Contact a clinician`

## Scenario 15 — Itching or possible allergy

**Example user input:** “I am itching.”

**Triggers / keywords:** `itching`, `itchy`, `allergy`, `hives`, `welts`

**Predefined response:**

“Itching can have several causes, including skin irritation and allergic reactions. If you also have trouble breathing, throat tightness, faintness, or swelling of the tongue or throat, seek emergency help immediately. For persistent or widespread itching, a clinician can help identify the cause.”

**Quick replies:** `Rash too` · `Swelling or breathing trouble` · `Contact a clinician`

## Scenario 16 — Back pain

**Example user input:** “My back hurts.”

**Triggers / keywords:** `back pain`, `lower back pain`, `backache`

**Predefined response:**

“Back pain can have different causes. Avoid activities that clearly worsen it, and seek advice if it persists or limits normal activity. New loss of bladder or bowel control, numbness around the groin, or new or worsening leg weakness requires emergency assessment.”

**Quick replies:** `Where is the pain?` · `Warning signs` · `Contact a clinician`

## Scenario 17 — Joint pain

**Example user input:** “My knee hurts.”

**Triggers / keywords:** `joint pain`, `knee pain`, `shoulder pain`, `joint swelling`

**Predefined response:**

“Joint pain can result from injury, inflammation, overuse, or other conditions. Note when it started and whether there is swelling or restricted movement. A hot, red, swollen joint with fever, severe pain after injury, or inability to bear weight needs prompt medical assessment.”

**Quick replies:** `Injury or no injury?` · `Swelling` · `Contact a clinician`

## Scenario 18 — Muscle cramps

**Example user input:** “I have muscle cramps.”

**Triggers / keywords:** `muscle cramp`, `muscle cramps`, `muscle spasm`

**Predefined response:**

“Muscle cramps may be associated with exertion, hydration, medicines, or other factors. Note which muscle is affected and how often it happens. Seek medical assessment for persistent cramps, significant weakness, severe swelling, or dark urine after intense exercise.”

**Quick replies:** `Where are the cramps?` · `After exercise?` · `Contact a clinician`

## Scenario 19 — Eye redness or irritation

**Example user input:** “My eye is red.”

**Triggers / keywords:** `red eye`, `eye irritation`, `itchy eyes`, `eye pain`

**Predefined response:**

“Eye redness can have many causes. Severe eye pain, sudden vision changes, chemical exposure, or redness in a contact-lens wearer with pain requires urgent professional assessment. Avoid rubbing the eye and seek appropriate care if symptoms persist.”

**Quick replies:** `Vision changed?` · `Eye pain?` · `Contact a clinician`

## Scenario 20 — Ear pain

**Example user input:** “My ear hurts.”

**Triggers / keywords:** `earache`, `ear pain`, `ear discharge`, `hearing change`

**Predefined response:**

“Ear pain can have several causes. Avoid putting objects or unprescribed substances into the ear. Seek prompt medical advice for sudden hearing loss, swelling behind the ear, severe dizziness, facial weakness, or significant pain with fever.”

**Quick replies:** `Hearing changed?` · `Fluid from ear?` · `Contact a clinician`

## Scenario 21 — Shortness of breath

**Example user input:** “I am having trouble breathing.”

**Triggers / keywords:** `shortness of breath`, `breathless`, `difficulty breathing`, `cannot breathe`, `gasping`

**Safety level:** URGENT

**Predefined response:**

“Severe or new difficulty breathing can be an emergency. Please contact your local emergency service now or have someone nearby help you obtain emergency care. Do not wait for this chatbot to assess the cause. If you are in India, the national emergency number is 112. Do not drive yourself if you are severely breathless.”

**Quick replies:** `Get emergency help` · `I am safe and want general information`

**Flow:** Emergency response takes precedence over all routine symptom scenarios.

## Scenario 22 — Chest pain

**Example user input:** “I have chest pain.”

**Triggers / keywords:** `chest pain`, `chest pressure`, `tight chest`, `chest heaviness`

**Safety level:** URGENT

**Predefined response:**

“New, severe, or unexplained chest pain or pressure may be an emergency, especially with breathlessness, sweating, nausea, faintness, or pain spreading to the arm, back, neck, or jaw. Contact your local emergency service immediately. In India, call 112. Do not use this chatbot to rule out a heart problem.”

**Quick replies:** `Get emergency help` · `I am safe and want general information`

## Scenario 23 — Possible stroke symptoms

**Example user input:** “My face is drooping and I cannot speak properly.”

**Triggers / keywords:** `face drooping`, `sudden weakness`, `slurred speech`, `cannot speak`, `stroke symptoms`

**Safety level:** URGENT

**Predefined response:**

“Sudden facial drooping, arm weakness, or difficulty speaking can indicate a stroke. Call emergency services immediately. Note the time symptoms began if you can do so without delaying help. Do not wait for symptoms to improve or continue chatting.”

**Quick replies:** `Get emergency help`

## Scenario 24 — Severe bleeding

**Example user input:** “The bleeding will not stop.”

**Triggers / keywords:** `heavy bleeding`, `bleeding will not stop`, `severe bleeding`, `large blood loss`

**Safety level:** URGENT

**Predefined response:**

“Severe or uncontrolled bleeding requires emergency assistance. Call your local emergency service now. If it is an external wound, apply firm, continuous pressure with a clean cloth or dressing if safe to do so while help is on the way. Do not delay emergency care to answer chatbot questions.”

**Quick replies:** `Get emergency help`

## Scenario 25 — Possible severe allergic reaction

**Example user input:** “My lips are swelling and I am struggling to breathe.”

**Triggers / keywords:** `throat swelling`, `tongue swelling`, `lip swelling with breathing trouble`, `anaphylaxis`, `severe allergic reaction`

**Safety level:** URGENT

**Predefined response:**

“Swelling of the tongue or throat, or an allergic reaction with breathing difficulty or faintness, may be life-threatening. Call emergency services immediately. If you have a prescribed emergency allergy treatment, follow your clinician's instructions. Do not wait for another chatbot response.”

**Quick replies:** `Get emergency help`

## Scenario 26 — Understanding a laboratory report

**Example user input:** “Can you explain my blood test report?”

**Triggers / keywords:** `explain lab report`, `blood test report`, `lab results`, `test report meaning`

**Predefined response:**

“Yes. Upload a clear image or PDF of your report. I can help extract the test names, reported values, units, and reference ranges, then explain them in simpler language. OCR can make mistakes, so please verify the extracted values against the original report before relying on the explanation.”

**Quick replies:** `Upload a report` · `What is a reference range?` · `Show demo report`

## Scenario 27 — High glucose result

**Example user input:** “My glucose result is high.”

**Triggers / keywords:** `high glucose`, `high blood sugar`, `glucose elevated`, `blood sugar result`

**Predefined response:**

“I can help you understand what the report says. Please check whether the test was fasting, random, or after a meal, and share the reported value, unit, and reference range if you want an explanation. A single result does not establish a diagnosis. A clinician should interpret it in context.”

**Quick replies:** `Upload my report` · `Explain units` · `Contact a clinician`

## Scenario 28 — High HbA1c result

**Example user input:** “My HbA1c is elevated.”

**Triggers / keywords:** `high hba1c`, `elevated hba1c`, `glycated hemoglobin`, `a1c result`

**Predefined response:**

“HbA1c reflects average blood glucose over roughly the previous two to three months. The interpretation depends on the exact value, units, clinical context, and applicable guidance. Share the report if you would like help understanding the wording. Do not change medication based on this chatbot.”

**Quick replies:** `Upload my report` · `Explain HbA1c` · `Contact a clinician`

## Scenario 29 — Low hemoglobin result

**Example user input:** “My hemoglobin is low.”

**Triggers / keywords:** `low hemoglobin`, `low hb`, `hemoglobin result`, `anemia report`

**Predefined response:**

“Your report may flag hemoglobin as below its reference range. Hemoglobin is a protein in red blood cells that carries oxygen. The significance depends on the exact result, units, reference range, symptoms, and medical history. I can explain the report, but a clinician must assess the cause.”

**Quick replies:** `Upload my report` · `Explain reference range` · `Contact a clinician`

## Scenario 30 — Kidney function report

**Example user input:** “What does my creatinine result mean?”

**Triggers / keywords:** `creatinine`, `kidney function`, `egfr`, `renal function report`

**Predefined response:**

“Creatinine is a blood measurement commonly used, alongside other information, to assess kidney function. Interpretation depends on the value, unit, reference range, estimated filtration rate where available, and clinical context. Upload the report so I can help explain its recorded values without diagnosing kidney disease.”

**Quick replies:** `Upload my report` · `Explain eGFR` · `Contact a clinician`

## Scenario 31 — Cholesterol report

**Example user input:** “Can you explain my cholesterol results?”

**Triggers / keywords:** `cholesterol`, `lipid profile`, `ldl`, `hdl`, `triglycerides`

**Predefined response:**

“A lipid profile may include total cholesterol, LDL, HDL, and triglycerides. These values are interpreted together with other cardiovascular risk factors and the applicable clinical guidance. Upload your report to review the recorded values, units, and reference information.”

**Quick replies:** `Upload my report` · `Explain LDL and HDL` · `Contact a clinician`

## Scenario 32 — Thyroid test

**Example user input:** “What does my TSH result mean?”

**Triggers / keywords:** `tsh`, `thyroid test`, `thyroid report`, `t3`, `t4`

**Predefined response:**

“TSH is a hormone measurement used in evaluating thyroid function. Its interpretation may depend on the laboratory range, related thyroid tests, medicines, pregnancy status where relevant, and clinical history. Share your report if you want help understanding its wording and values.”

**Quick replies:** `Upload my report` · `Explain TSH` · `Contact a clinician`

## Scenario 33 — Understanding a prescription

**Example user input:** “Can you read my prescription?”

**Triggers / keywords:** `read prescription`, `explain prescription`, `medicine prescription`, `prescription OCR`

**Predefined response:**

“Upload a clear image or PDF of the prescription. I can try to extract medicine names and written instructions, then show them for verification. Handwriting and abbreviations may be misread. Confirm uncertain details with the prescribing clinician or pharmacist before taking a medicine.”

**Quick replies:** `Upload prescription` · `Prescription is handwritten` · `Medicine safety`

## Scenario 34 — Missed medication dose

**Example user input:** “I missed my medicine dose.”

**Triggers / keywords:** `missed dose`, `forgot medicine`, `forgot medication`, `missed medication`

**Predefined response:**

“What to do after a missed dose depends on the specific medicine and its official instructions. Check the patient information leaflet or contact your pharmacist or prescriber. Do not double a dose unless your clinician's instructions specifically tell you to do so. I can help you locate the relevant instructions in an uploaded document.”

**Quick replies:** `Find instructions in my record` · `Contact a pharmacist`

## Scenario 35 — Medication side effect

**Example user input:** “I think my medicine is causing side effects.”

**Triggers / keywords:** `medicine side effects`, `drug reaction`, `side effects`, `reaction to medication`

**Predefined response:**

“Some symptoms may be related to medicines, but the cause cannot be confirmed from this message. If you have difficulty breathing, throat swelling, fainting, or another severe reaction, seek emergency help. Otherwise, contact your prescriber or pharmacist promptly and provide the medicine name, dose as prescribed, and when symptoms began. Do not stop essential medication without appropriate medical advice unless emergency instructions require immediate action.”

**Quick replies:** `Review my prescription` · `Possible emergency reaction` · `Contact a pharmacist`

## Scenario 36 — Drug interaction question

**Example user input:** “Can these two medicines be taken together?”

**Triggers / keywords:** `drug interaction`, `medicine interaction`, `can I take together`, `mix medicines`

**Predefined response:**

“Interactions depend on the exact medicine names, strengths, formulation, other medicines, and your health circumstances. I cannot safely confirm compatibility from incomplete information. Ask a pharmacist or prescriber to check the combination. You can upload your medication list to help organize the information for that review.”

**Quick replies:** `Upload medication list` · `Contact a pharmacist`

## Scenario 37 — Appointment preparation

**Example user input:** “Help me prepare for my doctor's appointment.”

**Triggers / keywords:** `doctor appointment`, `prepare for appointment`, `questions for doctor`, `medical visit`

**Predefined response:**

“I can help prepare a concise visit summary using your records. We can list your main concerns, symptom timeline, current medicines as documented, allergies you report, recent test results, and questions for your clinician. You can review everything before exporting or sharing it.”

**Quick replies:** `Create visit summary` · `Review medications` · `Review recent reports`

## Scenario 38 — Medical history summary

**Example user input:** “Summarize my medical history.”

**Triggers / keywords:** `medical history`, `health summary`, `summarize records`, `my health profile`

**Predefined response:**

“I can organize the records you have uploaded into a chronological health summary. It can include documented diagnoses, tests, prescriptions, and discharge information, with links to their source documents. Missing or conflicting information will be marked rather than guessed.”

**Quick replies:** `Open timeline` · `Upload a document` · `Generate summary`

## Scenario 39 — Telugu language support

**Example user input:** “Explain my report in Telugu.”

**Triggers / keywords:** `in telugu`, `telugu explanation`, `తెలుగులో చెప్పండి`, `translate report to telugu`

**Predefined response:**

“తప్పకుండా. మీ వైద్య నివేదికను అప్‌లోడ్ చేయండి. అందులో ఉన్న పరీక్షల పేర్లు, విలువలు, యూనిట్లు, రిఫరెన్స్ పరిధులను గుర్తించి సులభమైన తెలుగులో వివరించడానికి ప్రయత్నిస్తాను. ముఖ్యమైన విలువలను అసలు నివేదికతో సరిపోల్చి ధృవీకరించండి. ఈ వివరణ వైద్యుడి సలహాకు ప్రత్యామ్నాయం కాదు.”

**Quick replies:** `Upload a report` · `Explain in English` · `Open health timeline`

## Scenario 40 — Unknown question or unsupported request

**Example user input:** “Can you help me with something else?”

**Triggers / keywords:** Default fallback for unmatched messages.

**Predefined response:**

“I can help you understand uploaded medical records, review laboratory report wording, read supported printed prescriptions, summarize your health timeline, or prepare questions for a clinician. I cannot diagnose a condition, prescribe treatment, or reliably interpret every handwritten document. What would you like help with?”

**Quick replies:** `Explain a lab report` · `Read a prescription` · `Summarize my records` · `General symptom information`

---

# Emergency routing rules

Run emergency keyword checks before routine scenario matching. At minimum, route the following to an urgent response:

- Severe or new difficulty breathing.
- New or unexplained chest pain with concerning symptoms.
- Sudden facial droop, weakness, or speech difficulty.
- Severe or uncontrolled bleeding.
- Tongue/throat swelling or severe allergic reaction with breathing symptoms.
- Unconsciousness, seizure, or severe confusion.
- Immediate self-harm danger if the chatbot is later expanded to mental health topics.

Emergency keyword detection is not a complete medical triage algorithm. It can miss emergencies and produce false positives. Show a persistent emergency-help option, do not claim that absence of a match means a person is safe, and do not delay care with extra questions.

For India, emergency number 112 can be displayed where appropriate. Verify local emergency guidance before deployment in other regions.

# Intent matching rules

Use a dedicated matching module instead of embedding matching logic in the UI.

Recommended priority:

1. Emergency red flags.
2. Explicit document/task intents, such as uploading a report or reading a prescription.
3. Specific symptom intents.
4. General record and wellness intents.
5. Language-selection intent.
6. Fallback.

Use exact phrases and carefully chosen word-boundary matching to avoid false matches. For example, do not match `pain` as an arbitrary substring in unrelated words.

If two intents have similar match strength, ask a clarifying question rather than guessing.

Preserve the current scenario during follow-up turns so that answers such as “three days” can be interpreted as a response to the previous question rather than a new standalone query.

# Suggested folder structure

```text
src/
  components/
    HealthChatbot.astro
    ChatMessage.astro
    QuickReplies.astro
    EmergencyHelpBanner.astro
  data/
    healthChatScenarios.ts
    healthChatFlows.ts
  lib/
    chatbot/
      normalizeInput.ts
      matchIntent.ts
      routeEmergency.ts
      conversationEngine.ts
      safetyRules.ts
  types/
    healthChat.ts
  tests/
    healthChatScenarios.test.ts
    emergencyRouting.test.ts
```

Adapt this to the existing repository rather than duplicating files that already perform the same purpose.

# Acceptance criteria

- All 40 scenarios are available through the chatbot.
- Every scenario has an ID, title, trigger phrases, deterministic response, and relevant quick replies.
- Common example messages such as “I have fever”, “explain my HbA1c”, and “read my prescription” reach the expected scenarios.
- Emergency routing takes precedence over routine flows.
- Ambiguous requests prompt clarification.
- Unknown inputs use a helpful fallback.
- Quick replies and follow-up questions work without resetting context incorrectly.
- The chatbot can be restarted.
- No scenario claims to make a confirmed diagnosis or prescribe treatment.
- The interface works on desktop and mobile and is keyboard accessible.
- Automated tests cover every scenario, representative variations, ambiguous inputs, and emergency precedence.
- Documentation clearly states that this is a deterministic demo chatbot with predefined responses, not a validated clinical decision-support system.

# Implementation instruction

Implement these scenarios as structured data, then connect them to the existing Copilot/chat UI. Do not create 40 unrelated hardcoded UI components. Keep response content, intent rules, conversation state, and presentation separate so that a future AI-backed version can reuse the same safety and data structures.
