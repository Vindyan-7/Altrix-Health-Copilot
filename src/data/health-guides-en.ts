import type { HealthGuide } from './health-guide-types';

/**
 * Curated Health Guide Catalogue (English)
 * Sourced strictly from authoritative health organizations (CDC, MedlinePlus, AHA, Indian National Health Helpline 112).
 * These guides contain original concise educational summaries without fabricating clinical claims or individualized dosing.
 */
export const HEALTH_GUIDES_EN: Record<string, HealthGuide> = {
  // 1. Symptoms: Fever
  fever: {
    id: 'fever',
    category: 'symptom',
    locale: 'en',
    title: 'Fever (Elevated Body Temperature)',
    summary:
      'A fever is a temporary increase in body temperature, often due to an illness or immune response fighting an infection. For adults, a temperature of 100.4°F (38°C) or higher is generally considered a fever.',
    details: [
      'Stay well hydrated with water, clear broths, or oral rehydration solutions.',
      'Rest in a comfortable, cool environment and wear light, breathable clothing.',
      'Monitor temperature periodically with a clean digital thermometer.',
      'Do not bundle up in heavy blankets or take cold ice baths.',
    ],
    warningSigns: [
      'Fever reaching 103°F (39.4°C) or higher that does not respond to cooling.',
      'Fever lasting more than 3 consecutive days.',
      'Accompanied by stiff neck, mental confusion, or extreme lethargy.',
      'Accompanied by persistent vomiting, shortness of breath, or new unexplained rash.',
      'Fever in infants under 3 months old (requires immediate pediatric evaluation).',
    ],
    nextSteps: [
      'Rest and maintain adequate fluid intake.',
      'Consult a primary care doctor if the fever persists past 48–72 hours.',
      'Seek emergency care immediately if red-flag signs (stiff neck, confusion, breathing distress) develop.',
    ],
    sourceName: 'MedlinePlus Medical Encyclopedia — Fever',
    sourceUrl: 'https://medlineplus.gov/ency/article/003090.htm',
    reviewedDate: '2026-10-12',
    clinicalDisclaimer:
      'Educational guide only. Not a medical diagnosis or treatment plan. Always seek professional advice from a licensed healthcare provider.',
    quickQuestions: [
      'What warning signs mean a fever needs urgent attention?',
      'How much fluid should I drink while managing a fever?',
      'When should a child with fever be seen by a doctor?',
    ],
  },

  // 1. Symptoms: Cold & Cough
  'cold-cough': {
    id: 'cold-cough',
    category: 'symptom',
    locale: 'en',
    title: 'Common Cold and Acute Cough',
    summary:
      'A common cold is a viral respiratory tract infection that typically affects the nose and throat. Symptoms usually peak within 2 to 3 days and resolve on their own within 7 to 10 days.',
    details: [
      'Get plenty of restorative rest to support your immune system.',
      'Drink warm fluids (herbal teas, warm water with lemon) to soothe an irritated throat.',
      'Use a clean humidifier or inhale steam from a warm shower to relieve nasal congestion.',
      'Saline nasal sprays or saline rinses can help loosen nasal mucus safely.',
      'Antibiotics do not work against viral colds and should never be taken without a prescription.',
    ],
    warningSigns: [
      'Difficulty breathing, wheezing, or persistent shortness of breath.',
      'Coughing up blood or rust-colored phlegm.',
      'Severe chest tightness or pain during breathing or coughing.',
      'Symptoms that worsen significantly after initially improving (possible secondary infection).',
      'Cough lasting longer than 3 weeks without improvement.',
    ],
    nextSteps: [
      'Use supportive home self-care and hydrate consistently.',
      'Contact a doctor if symptoms persist past 10–14 days or worsen suddenly.',
      'Seek emergency care immediately if experiencing breathing difficulty or chest pain.',
    ],
    sourceName: 'CDC — Common Cold Treatment and Prevention',
    sourceUrl: 'https://www.cdc.gov/common-cold/treatment/',
    reviewedDate: '2026-10-12',
    clinicalDisclaimer:
      'Educational information only. Colds are viral; antibiotics are ineffective against viruses. Consult a clinician for persistent respiratory issues.',
    quickQuestions: [
      'How long does a typical viral cold last?',
      'What symptoms indicate a cold has turned into something serious?',
      'Why are antibiotics not used for standard colds?',
    ],
  },

  // 1. Symptoms: Headache & Migraine
  headache: {
    id: 'headache',
    category: 'symptom',
    locale: 'en',
    title: 'Headache and Migraine Overview',
    summary:
      'Headaches involve pain in the head, scalp, or neck. Common types include tension headaches, dehydration-related headaches, and migraines, which may feature pulsing pain, light sensitivity, and nausea.',
    details: [
      'Rest in a quiet, dark room with a cool compress on the forehead or neck.',
      'Ensure adequate hydration by drinking water gradually.',
      'Practice gentle neck and shoulder stretches if tension is a factor.',
      'Keep a symptom journal noting potential triggers such as lack of sleep, skipping meals, or stress.',
    ],
    warningSigns: [
      'Sudden, explosive "thunderclap" headache reaching maximum severity in seconds.',
      'Headache accompanied by high fever, stiff neck, mental confusion, or altered speech.',
      'Headache accompanied by numbness, weakness on one side of the face or body, or vision loss.',
      'Headache occurring immediately after head trauma or physical injury.',
      'New or worsening headache pattern in individuals over age 50.',
    ],
    nextSteps: [
      'Rest in a darkened, calm environment and rehydrate.',
      'Schedule a routine evaluation with a clinician for recurrent or chronic headaches.',
      'Call emergency services (112 / 911) immediately if sudden explosive pain or neurological deficits occur.',
    ],
    sourceName: 'MedlinePlus — Headache Information & Red Flags',
    sourceUrl: 'https://medlineplus.gov/headache.html',
    reviewedDate: '2026-10-12',
    clinicalDisclaimer:
      'General educational summary. A sudden explosive headache requires urgent emergency evaluation. Do not ignore severe neurological signs.',
    quickQuestions: [
      'What is a thunderclap headache and why is it an emergency?',
      'What are common non-medical triggers for tension headaches?',
      'When should frequent headaches be evaluated by a neurologist?',
    ],
  },

  // 1. Symptoms: Stomach Pain
  'stomach-pain': {
    id: 'stomach-pain',
    category: 'symptom',
    locale: 'en',
    title: 'Abdominal / Stomach Discomfort',
    summary:
      'Abdominal discomfort can stem from indigestion, gas, mild viral gastroenteritis, or constipation. However, severe or sharp localized abdominal pain can indicate conditions requiring urgent medical assessment.',
    details: [
      'Sip clear fluids or electrolyte solutions slowly to prevent dehydration.',
      'Avoid greasy, heavily spiced, acidic, or fried foods while experiencing stomach upset.',
      'Stick to bland, easy-to-digest items (rice, toast, bananas, broth) as tolerance allows.',
      'Avoid taking NSAIDs (like ibuprofen) on an empty or upset stomach as they can irritate the gastric lining.',
    ],
    warningSigns: [
      'Severe, unbearable, or sudden sharp localized abdominal pain.',
      'Pain accompanied by high fever, repeated uncontrollable vomiting, or inability to keep fluids down.',
      'Abdomen that is rigid, hard to the touch, or severely tender when pressed.',
      'Vomiting blood or passing black, tarry, or bloody stools.',
      'Pain radiating to the chest, neck, or back, or accompanied by dizziness/fainting.',
    ],
    nextSteps: [
      'Rest your digestive system and drink fluids in small, frequent sips.',
      'Contact a doctor if mild pain lasts more than 24 to 48 hours.',
      'Seek emergency medical care immediately if severe localized pain, rigidity, or bleeding is present.',
    ],
    sourceName: 'MedlinePlus — Abdominal Pain Warning Signs',
    sourceUrl: 'https://medlineplus.gov/abdominalpain.html',
    reviewedDate: '2026-10-12',
    clinicalDisclaimer:
      'Educational guide. Severe abdominal tenderness, rigidity, or vomiting blood requires emergency medical evaluation immediately.',
    quickQuestions: [
      'What symptoms with stomach pain mean an emergency room visit is needed?',
      'What bland foods are safest during an upset stomach?',
      'Why should pain relievers like ibuprofen be used with caution during stomach pain?',
    ],
  },

  // 2. Medicine Information: General Principles
  'medicine-info': {
    id: 'medicine-info',
    category: 'medicine',
    locale: 'en',
    title: 'Safe Medication Use & General Information',
    summary:
      'Medications should be used exactly as directed by a licensed physician or pharmacist. General guidance emphasizes checking labels, respecting daily limits, and never altering doses independently.',
    details: [
      'Always read the active ingredients listed on the package to avoid taking duplicate drugs.',
      'Paracetamol (Acetaminophen) is commonly used for fever and mild aches; do not exceed the stated package maximum to protect your liver.',
      'Store medicines in their original containers in a cool, dry place away from children and moisture.',
      'Never take leftover antibiotics or share prescription medicines with others.',
      'No medication is universally safe: age, liver/kidney function, underlying conditions, and pregnancy status all alter safety profiles.',
      'This assistant does not provide personalized dosage calculations, drug interaction checks, or prescription modifications.',
    ],
    warningSigns: [
      'Signs of severe allergic reaction: hives, facial swelling, lip or tongue swelling, difficulty breathing.',
      'Accidental overdose or taking more than the maximum daily package limit.',
      'Severe unexplained dizziness, nausea, or rash after starting a new medicine.',
      'Taking multiple medicines that contain the same active ingredient.',
    ],
    nextSteps: [
      'Check the physical label or package insert on your medicine for official manufacturer directions.',
      'Consult a licensed pharmacist or physician for personal dosing, interactions, pregnancy safety, and suitability.',
      'In case of accidental overdose, contact your local poison control center or emergency services immediately.',
    ],
    sourceName: 'MedlinePlus Drug Information & FDA Safe Use',
    sourceUrl: 'https://medlineplus.gov/druginformation.html',
    reviewedDate: '2026-10-12',
    clinicalDisclaimer:
      'Educational overview only. We do not provide individualized dosing, safety guarantees, pregnancy approvals, or medication changes. Always follow your prescription.',
    quickQuestions: [
      'Why is it dangerous to combine multiple cold medications?',
      'What should I do if I suspect an allergic drug reaction?',
      'Where can I verify official medication ingredients and safety warnings?',
    ],
  },

  // 3. Emergency Signs: Heart Attack & Stroke
  'emergency-signs': {
    id: 'emergency-signs',
    category: 'emergency',
    locale: 'en',
    title: 'Heart Attack & Stroke Warning Signs (Critical)',
    summary:
      'Heart attacks and strokes are time-critical medical emergencies. Immediate emergency treatment drastically reduces the risk of death or permanent disability. Call emergency services without delay.',
    details: [
      'Heart Attack Signs: Chest pain, tightness, pressure, or squeezing; pain radiating to jaw, neck, back, or one/both arms; shortness of breath; cold sweat, dizziness, or lightheadedness.',
      'Stroke FAST Signs: F = Face drooping on one side; A = Arm weakness (one arm drifts down); S = Speech difficulty or slurred words; T = Time to call emergency services immediately.',
      'Do not attempt to drive yourself to the hospital if experiencing these symptoms.',
      'Every minute counts: emergency medical crews can begin life-saving treatment en route.',
    ],
    warningSigns: [
      'Any sudden chest pressure, tightness, or radiating discomfort.',
      'Sudden numbness or weakness of the face, arm, or leg, especially on one side of the body.',
      'Sudden confusion, trouble speaking, or difficulty understanding speech.',
      'Sudden trouble seeing in one or both eyes, or sudden severe loss of balance.',
    ],
    nextSteps: [
      'CALL EMERGENCY SERVICES IMMEDIATELY: Dial 112 (India) or 911 (US) or local emergency dispatch.',
      'Sit or lie down in a safe, resting position; loosen tight clothing around the neck.',
      'Notify anyone nearby so they can assist you and direct first responders.',
      'Do not wait to see if symptoms improve on their own.',
    ],
    sourceName: 'American Heart Association — Heart Attack & Stroke Warning Signs',
    sourceUrl: 'https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack',
    reviewedDate: '2026-10-12',
    clinicalDisclaimer:
      'CRITICAL EMERGENCY INFORMATION: If you suspect a heart attack or stroke, call emergency services (112 / 911) right now. Do not wait.',
    quickQuestions: [
      'What does the F.A.S.T. acronym stand for in stroke detection?',
      'What are atypical heart attack symptoms (especially in women)?',
      'What should you do while waiting for emergency responders?',
    ],
  },

  // 4. First Aid: CPR & Basic Emergency Response
  cpr: {
    id: 'cpr',
    category: 'first_aid',
    locale: 'en',
    title: 'Hands-Only CPR & Basic First Aid Response',
    summary:
      'Cardiopulmonary Resuscitation (CPR) is an emergency lifesaving procedure performed when the heart stops beating. Hands-Only CPR can double or triple a person’s chance of survival if started immediately.',
    details: [
      'Step 1 (Check & Call): Check for responsiveness and breathing. If the person is unresponsive and not breathing (or only gasping), shout for help and immediately CALL 112 (India) or 911 (US).',
      'Step 2 (Get an AED): If available, send someone to retrieve an Automated External Defibrillator (AED).',
      'Step 3 (Hand Position): Place the heel of one hand in the center of the person’s chest. Place your other hand on top and interlock your fingers.',
      'Step 4 (Push Hard & Fast): Push hard and fast in the center of the chest at a rate of 100 to 120 beats per minute (to the beat of the song "Stayin\' Alive"). Compress the chest at least 2 inches (5 cm) deep and allow complete chest recoil between compressions.',
      'Step 5 (Continue): Continue uninterrupted compressions until an AED arrives, the person shows obvious signs of life, or emergency medical personnel take over.',
    ],
    warningSigns: [
      'Unresponsive person with absent or abnormal breathing (agonal gasping).',
      'No signs of circulation, movement, or breathing.',
    ],
    nextSteps: [
      'Call 112 / 911 immediately.',
      'Start Hands-Only chest compressions hard and fast in the center of the chest.',
      'Follow automated voice prompts if an AED is present.',
    ],
    sourceName: 'American Heart Association — What is CPR & Hands-Only CPR',
    sourceUrl: 'https://cpr.heart.org/en/resources/what-is-cpr',
    reviewedDate: '2026-10-12',
    clinicalDisclaimer:
      'First aid guidance only. A digital guide cannot replace professional CPR certification or emergency medical responders. Call emergency dispatch immediately.',
    quickQuestions: [
      'What is the recommended rate for chest compressions?',
      'How deep should chest compressions be for an adult?',
      'What should I do if an AED is available?',
    ],
  },

  // 5. General Health: Hydration & Preventive Wellness
  wellness: {
    id: 'wellness',
    category: 'general',
    locale: 'en',
    title: 'General Wellness & Preventive Health Habits',
    summary:
      'Fundamental healthy daily habits support immune function, cardiovascular wellness, and overall metabolic health.',
    details: [
      'Hydration: Drink water consistently throughout the day. Pale straw-colored urine indicates healthy hydration.',
      'Sleep: Aim for 7 to 9 hours of quality, consistent sleep each night to allow bodily tissue recovery.',
      'Physical Activity: Strive for at least 150 minutes of moderate aerobic exercise (like brisk walking) each week.',
      'Balanced Nutrition: Emphasize whole grains, fiber, vegetables, and lean proteins while moderating refined sugars and sodium.',
      'Routine Checkups: Regular blood pressure, lipid, and blood sugar screenings help detect asymptomatic conditions early.',
    ],
    warningSigns: [
      'Sudden unintentional weight loss or extreme chronic fatigue.',
      'Persistent changes in bowel or bladder habits lasting weeks.',
      'New unexplained lumps, persistent pain, or non-healing sores.',
    ],
    nextSteps: [
      'Incorporate small, sustainable lifestyle habits into your daily routine.',
      'Schedule annual preventive health assessments with your family doctor.',
    ],
    sourceName: 'MedlinePlus & CDC Preventive Health Guidelines',
    sourceUrl: 'https://medlineplus.gov/',
    reviewedDate: '2026-10-12',
    clinicalDisclaimer:
      'General health education. Does not substitute for personalized medical checkups or medical condition management.',
    quickQuestions: [
      'How much physical activity is recommended for adults per week?',
      'What are key signs of healthy hydration?',
      'What routine screenings are recommended for adults?',
    ],
  },

  // 6. First Aid: Bleeding & Wound Care
  'bleeding-first-aid': {
    id: 'bleeding-first-aid',
    category: 'first_aid',
    locale: 'en',
    title: 'Bleeding & Wound First Aid',
    summary:
      'Proper first aid depends on whether bleeding is severe and uncontrolled or minor. Follow clarifying triage steps below to assess urgency.',
    details: [
      'Clarifying Assessment 1 (Emergency): Is blood spurting, pulsing, or failing to stop after 10-15 minutes of firm, direct pressure? If YES, this is a medical emergency — Call 112 (India) or 911 (US) immediately.',
      'Clarifying Assessment 2 (Minor Wound): Is the cut minor (shallow scrape or small puncture with bleeding stopped)? If YES, proceed with standard home self-care.',
      'Minor Wound Care: Wash hands thoroughly. Rinse the cut gently under running clean water and mild soap to remove dirt.',
      'Direct Pressure: Place a clean cloth or sterile gauze over the wound and apply firm, continuous pressure for 5-10 minutes. Do not peek repeatedly.',
      'Protection: Apply a thin layer of petroleum jelly or antiseptic ointment, then cover with a sterile adhesive bandage. Change bandage daily or when wet.',
      'Tetanus Evaluation: Seek medical advice if the cut was caused by rusty metal, dirt, animal bites, or if you have not had a tetanus booster in the last 5-10 years.',
    ],
    warningSigns: [
      'Severe / Critical: Blood is spurting, soaking through multiple bandages, or not stopping after 10-15 minutes of direct pressure.',
      'Deep gaping wound where edges cannot be easily pulled together (may need stitches within 6-8 hours).',
      'The person feels faint, pale, cold, clammy, or dizzy (signs of hypovolemic shock — call 112/911 immediately).',
      'Signs of infection developing later: worsening redness, warmth, swelling, throbbing pain, or pus drainage.',
    ],
    nextSteps: [
      'If bleeding is uncontrolled or spurting: Call 112 / 108 (India) or 911 (US) immediately; keep continuous direct pressure and elevate the limb if possible.',
      'For minor cuts: Clean thoroughly, apply gentle pressure, dress with a clean bandage, and keep clean and dry.',
      'Consult a doctor or clinic if the wound is deep, caused by an animal/human bite, or if you suspect foreign objects remain inside.',
    ],
    sourceName: 'American Red Cross & CDC — First Aid for Bleeding',
    sourceUrl: 'https://www.cdc.gov/niosh/topics/firstaid/bleeding.html',
    reviewedDate: '2026-10-12',
    clinicalDisclaimer:
      'First-aid educational guidance only. Uncontrolled bleeding requires immediate emergency medical services (112 / 911).',
    quickQuestions: [
      'How long should you hold direct pressure on a bleeding cut?',
      'When does a cut require stitches or a tetanus shot?',
      'What are the signs of shock from severe blood loss?',
    ],
  },
};

