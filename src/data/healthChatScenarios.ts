/**
 * Altrix Health Copilot — 40 Guided Chatbot Scenarios Registry
 * Derived directly from root 'health_copilot_40_chatbot_scenarios.md'
 * Preserves canonical IDs, triggers, quick replies, and exact predefined responses.
 */

import type { ChatScenario } from '../types/healthChat';

export const HEALTH_CHAT_SCENARIOS: ChatScenario[] = [
  {
    "id": "scenario-01",
    "scenarioNumber": 1,
    "title": "Fever",
    "exampleInput": "I have a fever.",
    "triggers": [
      "fever",
      "temperature",
      "high temperature",
      "feeling feverish",
      "body is hot"
    ],
    "keywords": [
      "fever",
      "temperature",
      "high temperature",
      "feeling feverish",
      "body is hot"
    ],
    "response": "I’m sorry you’re feeling unwell. I can help you find general information, but I can’t diagnose the cause of a fever. If you can, measure your temperature and note when it started and any other symptoms. Seek urgent medical help if you have trouble breathing, confusion, a seizure, a stiff neck with severe headache, or another rapidly worsening symptom. Would you like help organizing your symptoms or learning when to contact a clinician?",
    "quickReplies": [
      "How long should I monitor it?",
      "Other symptoms",
      "Urgent warning signs"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "flowNotes": "Ask when it started and whether there are severe symptoms. Do not infer a cause or recommend a drug/dose.",
    "sourceCitations": [
      {
        "title": "Fever in Adults and Children",
        "url": "https://medlineplus.gov/fever.html",
        "organization": "MedlinePlus"
      },
      {
        "title": "Fever Symptoms and Care",
        "url": "https://www.cdc.gov",
        "organization": "CDC"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-02",
    "scenarioNumber": 2,
    "title": "Headache",
    "exampleInput": "I have a headache.",
    "triggers": [
      "headache",
      "head pain",
      "my head hurts"
    ],
    "keywords": [
      "headache",
      "head pain",
      "my head hurts"
    ],
    "response": "Headaches can have many causes. Note when it began, how severe it is, and whether it is different from headaches you have had before. A sudden, extremely severe headache, or headache with weakness, confusion, fainting, fever and stiff neck, or a recent serious head injury needs urgent medical assessment.",
    "quickReplies": [
      "Describe the headache",
      "Warning signs",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Headache Causes and Warnings",
        "url": "https://medlineplus.gov/headache.html",
        "organization": "MedlinePlus"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-03",
    "scenarioNumber": 3,
    "title": "Cough",
    "exampleInput": "I have a cough.",
    "triggers": [
      "cough",
      "coughing",
      "dry cough",
      "wet cough"
    ],
    "keywords": [
      "cough",
      "coughing",
      "dry cough",
      "wet cough"
    ],
    "response": "A cough can occur for several reasons, and this chat cannot determine the cause. Note how long it has lasted and whether you have fever, breathlessness, chest pain, or blood when coughing. Seek urgent care for severe breathing difficulty, blue or grey lips, or significant coughing of blood.",
    "quickReplies": [
      "Cough duration",
      "Other symptoms",
      "Warning signs"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Cough Evaluation and Care",
        "url": "https://medlineplus.gov/cough.html",
        "organization": "MedlinePlus"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-04",
    "scenarioNumber": 4,
    "title": "Sore throat",
    "exampleInput": "My throat hurts.",
    "triggers": [
      "sore throat",
      "throat pain",
      "pain swallowing",
      "throat hurts"
    ],
    "keywords": [
      "sore throat",
      "throat pain",
      "pain swallowing",
      "throat hurts"
    ],
    "response": "A sore throat can have different causes. Keep track of its duration and associated symptoms. Trouble breathing, inability to swallow saliva, or rapidly increasing swelling requires urgent medical attention. A clinician can assess persistent or worsening symptoms.",
    "quickReplies": [
      "Difficulty swallowing",
      "How long has it lasted?",
      "Warning signs"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-05",
    "scenarioNumber": 5,
    "title": "Runny or blocked nose",
    "exampleInput": "My nose is blocked.",
    "triggers": [
      "blocked nose",
      "stuffy nose",
      "runny nose",
      "sneezing",
      "nasal congestion"
    ],
    "keywords": [
      "blocked nose",
      "stuffy nose",
      "runny nose",
      "sneezing",
      "nasal congestion"
    ],
    "response": "A blocked or runny nose may occur with a cold, allergies, or other conditions. I can’t identify the cause from this message alone. Note how long it has lasted and whether you have fever, facial pain, or breathing problems. Seek professional advice if symptoms are severe or persistent.",
    "quickReplies": [
      "Sneezing and itchy eyes",
      "Fever too",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-06",
    "scenarioNumber": 6,
    "title": "Nausea or vomiting",
    "exampleInput": "I feel like vomiting.",
    "triggers": [
      "nausea",
      "vomiting",
      "throwing up",
      "feel sick"
    ],
    "keywords": [
      "nausea",
      "vomiting",
      "throwing up",
      "feel sick"
    ],
    "response": "Nausea and vomiting can have many causes. If you can tolerate fluids, small frequent sips may help while you monitor how you feel. Seek urgent care if you cannot keep fluids down, faint, become confused, have severe abdominal pain, vomit blood, or show signs of severe dehydration.",
    "quickReplies": [
      "I cannot keep fluids down",
      "Abdominal pain",
      "Other symptoms"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-07",
    "scenarioNumber": 7,
    "title": "Diarrhea",
    "exampleInput": "I have diarrhea.",
    "triggers": [
      "diarrhea",
      "loose stools",
      "frequent watery stool"
    ],
    "keywords": [
      "diarrhea",
      "loose stools",
      "frequent watery stool"
    ],
    "response": "Diarrhea can lead to dehydration. If you can drink safely, replace lost fluids using an appropriate oral rehydration solution according to its instructions. Seek medical advice for blood in stool, severe pain, persistent vomiting, signs of dehydration, or symptoms that are severe or prolonged.",
    "quickReplies": [
      "Signs of dehydration",
      "Blood in stool",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-08",
    "scenarioNumber": 8,
    "title": "Constipation",
    "exampleInput": "I am constipated.",
    "triggers": [
      "constipation",
      "hard stools",
      "difficulty passing stool",
      "cannot poop"
    ],
    "keywords": [
      "constipation",
      "hard stools",
      "difficulty passing stool",
      "cannot poop"
    ],
    "response": "Constipation can be related to diet, fluids, activity, medicines, or other conditions. Note how long it has been happening and whether your bowel habits have changed. Severe abdominal pain, vomiting, marked swelling, or inability to pass gas with constipation needs urgent assessment.",
    "quickReplies": [
      "How long has it lasted?",
      "Severe abdominal pain",
      "General information"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-09",
    "scenarioNumber": 9,
    "title": "Abdominal pain",
    "exampleInput": "My stomach hurts.",
    "triggers": [
      "stomach pain",
      "abdominal pain",
      "belly hurts",
      "stomach ache"
    ],
    "keywords": [
      "stomach pain",
      "abdominal pain",
      "belly hurts",
      "stomach ache"
    ],
    "response": "Abdominal pain has many possible causes. Its location, severity, onset, and associated symptoms matter. Seek urgent medical assessment for severe or sudden pain, a rigid or very swollen abdomen, fainting, blood in vomit or stool, or pain with possible pregnancy. Do not rely on this chatbot to determine the cause.",
    "quickReplies": [
      "Pain location",
      "Sudden or severe pain",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Abdominal Pain Warning Signs",
        "url": "https://medlineplus.gov/abdominalpain.html",
        "organization": "MedlinePlus"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-10",
    "scenarioNumber": 10,
    "title": "Heartburn or indigestion",
    "exampleInput": "I have heartburn.",
    "triggers": [
      "heartburn",
      "indigestion",
      "acid reflux",
      "burning chest after food"
    ],
    "keywords": [
      "heartburn",
      "indigestion",
      "acid reflux",
      "burning chest after food"
    ],
    "response": "Heartburn can cause a burning feeling after meals, but chest discomfort is not always caused by acid reflux. New or unexplained chest pressure, especially with breathlessness, sweating, nausea, or pain spreading to the arm, back, or jaw, requires emergency medical assessment.",
    "quickReplies": [
      "Explain common triggers",
      "Chest discomfort warning signs",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Heartburn and Reflux Overview",
        "url": "https://medlineplus.gov/heartburn.html",
        "organization": "MedlinePlus"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-11",
    "scenarioNumber": 11,
    "title": "Dizziness",
    "exampleInput": "I feel dizzy.",
    "triggers": [
      "dizzy",
      "dizziness",
      "lightheaded",
      "room spinning",
      "vertigo"
    ],
    "keywords": [
      "dizzy",
      "dizziness",
      "lightheaded",
      "room spinning",
      "vertigo"
    ],
    "response": "Dizziness can have several causes. Sit or lie somewhere safe and avoid driving while dizzy. Seek emergency help if it begins suddenly with weakness, facial droop, difficulty speaking, severe headache, fainting, chest pain, or difficulty walking.",
    "quickReplies": [
      "Spinning or lightheaded?",
      "Warning signs",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-12",
    "scenarioNumber": 12,
    "title": "Fatigue",
    "exampleInput": "I feel tired all the time.",
    "triggers": [
      "fatigue",
      "tired all the time",
      "low energy",
      "exhausted"
    ],
    "keywords": [
      "fatigue",
      "tired all the time",
      "low energy",
      "exhausted"
    ],
    "response": "Persistent fatigue can be associated with sleep, stress, medicines, anemia, thyroid problems, and many other factors. This message alone cannot identify the cause. Track how long it has lasted, sleep patterns, and related symptoms, and arrange a clinical review if it persists or affects daily activities.",
    "quickReplies": [
      "Sleep concerns",
      "Review my lab report",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-13",
    "scenarioNumber": 13,
    "title": "Difficulty sleeping",
    "exampleInput": "I cannot sleep.",
    "triggers": [
      "insomnia",
      "cannot sleep",
      "trouble sleeping",
      "poor sleep"
    ],
    "keywords": [
      "insomnia",
      "cannot sleep",
      "trouble sleeping",
      "poor sleep"
    ],
    "response": "Sleep difficulty can have many causes. A regular sleep and wake time, a relaxing wind-down routine, and reducing late-day caffeine may help some people. If the problem persists or significantly affects daily life, consider a healthcare professional's assessment. Do not start sleep medication based on this chatbot.",
    "quickReplies": [
      "Sleep routine",
      "Daytime tiredness",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-14",
    "scenarioNumber": 14,
    "title": "Skin rash",
    "exampleInput": "I have a rash.",
    "triggers": [
      "rash",
      "skin irritation",
      "itchy skin",
      "red patches"
    ],
    "keywords": [
      "rash",
      "skin irritation",
      "itchy skin",
      "red patches"
    ],
    "response": "A rash can result from irritation, allergy, infection, or other causes. Note when it started and any new products or medicines. A rash with breathing difficulty or swelling of the tongue or throat is an emergency. A rapidly spreading rash, fever, severe pain, or blistering needs prompt medical assessment.",
    "quickReplies": [
      "When did it start?",
      "Possible emergency signs",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-15",
    "scenarioNumber": 15,
    "title": "Itching or possible allergy",
    "exampleInput": "I am itching.",
    "triggers": [
      "itching",
      "itchy",
      "allergy",
      "hives",
      "welts"
    ],
    "keywords": [
      "itching",
      "itchy",
      "allergy",
      "hives",
      "welts"
    ],
    "response": "Itching can have several causes, including skin irritation and allergic reactions. If you also have trouble breathing, throat tightness, faintness, or swelling of the tongue or throat, seek emergency help immediately. For persistent or widespread itching, a clinician can help identify the cause.",
    "quickReplies": [
      "Rash too",
      "Swelling or breathing trouble",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-16",
    "scenarioNumber": 16,
    "title": "Back pain",
    "exampleInput": "My back hurts.",
    "triggers": [
      "back pain",
      "lower back pain",
      "backache"
    ],
    "keywords": [
      "back pain",
      "lower back pain",
      "backache"
    ],
    "response": "Back pain can have different causes. Avoid activities that clearly worsen it, and seek advice if it persists or limits normal activity. New loss of bladder or bowel control, numbness around the groin, or new or worsening leg weakness requires emergency assessment.",
    "quickReplies": [
      "Where is the pain?",
      "Warning signs",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-17",
    "scenarioNumber": 17,
    "title": "Joint pain",
    "exampleInput": "My knee hurts.",
    "triggers": [
      "joint pain",
      "knee pain",
      "shoulder pain",
      "joint swelling"
    ],
    "keywords": [
      "joint pain",
      "knee pain",
      "shoulder pain",
      "joint swelling"
    ],
    "response": "Joint pain can result from injury, inflammation, overuse, or other conditions. Note when it started and whether there is swelling or restricted movement. A hot, red, swollen joint with fever, severe pain after injury, or inability to bear weight needs prompt medical assessment.",
    "quickReplies": [
      "Injury or no injury?",
      "Swelling",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-18",
    "scenarioNumber": 18,
    "title": "Muscle cramps",
    "exampleInput": "I have muscle cramps.",
    "triggers": [
      "muscle cramp",
      "muscle cramps",
      "muscle spasm"
    ],
    "keywords": [
      "muscle cramp",
      "muscle cramps",
      "muscle spasm"
    ],
    "response": "Muscle cramps may be associated with exertion, hydration, medicines, or other factors. Note which muscle is affected and how often it happens. Seek medical assessment for persistent cramps, significant weakness, severe swelling, or dark urine after intense exercise.",
    "quickReplies": [
      "Where are the cramps?",
      "After exercise?",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-19",
    "scenarioNumber": 19,
    "title": "Eye redness or irritation",
    "exampleInput": "My eye is red.",
    "triggers": [
      "red eye",
      "eye irritation",
      "itchy eyes",
      "eye pain"
    ],
    "keywords": [
      "red eye",
      "eye irritation",
      "itchy eyes",
      "eye pain"
    ],
    "response": "Eye redness can have many causes. Severe eye pain, sudden vision changes, chemical exposure, or redness in a contact-lens wearer with pain requires urgent professional assessment. Avoid rubbing the eye and seek appropriate care if symptoms persist.",
    "quickReplies": [
      "Vision changed?",
      "Eye pain?",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-20",
    "scenarioNumber": 20,
    "title": "Ear pain",
    "exampleInput": "My ear hurts.",
    "triggers": [
      "earache",
      "ear pain",
      "ear discharge",
      "hearing change"
    ],
    "keywords": [
      "earache",
      "ear pain",
      "ear discharge",
      "hearing change"
    ],
    "response": "Ear pain can have several causes. Avoid putting objects or unprescribed substances into the ear. Seek prompt medical advice for sudden hearing loss, swelling behind the ear, severe dizziness, facial weakness, or significant pain with fever.",
    "quickReplies": [
      "Hearing changed?",
      "Fluid from ear?",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-21",
    "scenarioNumber": 21,
    "title": "Shortness of breath",
    "exampleInput": "I am having trouble breathing.",
    "triggers": [
      "shortness of breath",
      "breathless",
      "difficulty breathing",
      "cannot breathe",
      "gasping"
    ],
    "keywords": [
      "shortness of breath",
      "breathless",
      "difficulty breathing",
      "cannot breathe",
      "gasping"
    ],
    "response": "Severe or new difficulty breathing can be an emergency. Please contact your local emergency service now or have someone nearby help you obtain emergency care. Do not wait for this chatbot to assess the cause. If you are in India, the national emergency number is 112. Do not drive yourself if you are severely breathless.",
    "quickReplies": [
      "Get emergency help",
      "I am safe and want general information"
    ],
    "safetyLevel": "urgent",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "flowNotes": "Emergency response takes precedence over all routine symptom scenarios.",
    "sourceCitations": [
      {
        "title": "Breathing Difficulty Emergency",
        "url": "https://medlineplus.gov/breathingproblems.html",
        "organization": "MedlinePlus"
      },
      {
        "title": "India National Emergency Services 112",
        "url": "https://112.gov.in",
        "organization": "Emergency Response Support System (India)"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-22",
    "scenarioNumber": 22,
    "title": "Chest pain",
    "exampleInput": "I have chest pain.",
    "triggers": [
      "chest pain",
      "chest pressure",
      "tight chest",
      "chest heaviness"
    ],
    "keywords": [
      "chest pain",
      "chest pressure",
      "tight chest",
      "chest heaviness"
    ],
    "response": "New, severe, or unexplained chest pain or pressure may be an emergency, especially with breathlessness, sweating, nausea, faintness, or pain spreading to the arm, back, neck, or jaw. Contact your local emergency service immediately. In India, call 112. Do not use this chatbot to rule out a heart problem.",
    "quickReplies": [
      "Get emergency help",
      "I am safe and want general information"
    ],
    "safetyLevel": "urgent",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Warning Signs of a Heart Attack",
        "url": "https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack",
        "organization": "American Heart Association"
      },
      {
        "title": "India National Emergency Services 112",
        "url": "https://112.gov.in",
        "organization": "Emergency Response Support System (India)"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-23",
    "scenarioNumber": 23,
    "title": "Possible stroke symptoms",
    "exampleInput": "My face is drooping and I cannot speak properly.",
    "triggers": [
      "face drooping",
      "sudden weakness",
      "slurred speech",
      "cannot speak",
      "stroke symptoms"
    ],
    "keywords": [
      "face drooping",
      "sudden weakness",
      "slurred speech",
      "cannot speak",
      "stroke symptoms"
    ],
    "response": "Sudden facial drooping, arm weakness, or difficulty speaking can indicate a stroke. Call emergency services immediately. Note the time symptoms began if you can do so without delaying help. Do not wait for symptoms to improve or continue chatting.",
    "quickReplies": [
      "Get emergency help"
    ],
    "safetyLevel": "urgent",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Stroke Warning Signs (FAST)",
        "url": "https://www.heart.org/en/health-topics/stroke/signs-and-symptoms-of-stroke",
        "organization": "American Heart Association"
      },
      {
        "title": "India National Emergency Services 112",
        "url": "https://112.gov.in",
        "organization": "Emergency Response Support System (India)"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-24",
    "scenarioNumber": 24,
    "title": "Severe bleeding",
    "exampleInput": "The bleeding will not stop.",
    "triggers": [
      "heavy bleeding",
      "bleeding will not stop",
      "severe bleeding",
      "large blood loss"
    ],
    "keywords": [
      "heavy bleeding",
      "bleeding will not stop",
      "severe bleeding",
      "large blood loss"
    ],
    "response": "Severe or uncontrolled bleeding requires emergency assistance. Call your local emergency service now. If it is an external wound, apply firm, continuous pressure with a clean cloth or dressing if safe to do so while help is on the way. Do not delay emergency care to answer chatbot questions.",
    "quickReplies": [
      "Get emergency help"
    ],
    "safetyLevel": "urgent",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "First Aid for Severe Bleeding",
        "url": "https://medlineplus.gov/bleeding.html",
        "organization": "MedlinePlus"
      },
      {
        "title": "India National Emergency Services 112",
        "url": "https://112.gov.in",
        "organization": "Emergency Response Support System (India)"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-25",
    "scenarioNumber": 25,
    "title": "Possible severe allergic reaction",
    "exampleInput": "My lips are swelling and I am struggling to breathe.",
    "triggers": [
      "throat swelling",
      "tongue swelling",
      "lip swelling with breathing trouble",
      "anaphylaxis",
      "severe allergic reaction"
    ],
    "keywords": [
      "throat swelling",
      "tongue swelling",
      "lip swelling with breathing trouble",
      "anaphylaxis",
      "severe allergic reaction"
    ],
    "response": "Swelling of the tongue or throat, or an allergic reaction with breathing difficulty or faintness, may be life-threatening. Call emergency services immediately. If you have a prescribed emergency allergy treatment, follow your clinician's instructions. Do not wait for another chatbot response.",
    "quickReplies": [
      "Get emergency help"
    ],
    "safetyLevel": "urgent",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Anaphylaxis Emergency Management",
        "url": "https://medlineplus.gov/anaphylaxis.html",
        "organization": "MedlinePlus"
      },
      {
        "title": "India National Emergency Services 112",
        "url": "https://112.gov.in",
        "organization": "Emergency Response Support System (India)"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-26",
    "scenarioNumber": 26,
    "title": "Understanding a laboratory report",
    "exampleInput": "Can you explain my blood test report?",
    "triggers": [
      "explain lab report",
      "blood test report",
      "lab results",
      "test report meaning"
    ],
    "keywords": [
      "explain lab report",
      "blood test report",
      "lab results",
      "test report meaning"
    ],
    "response": "Yes. Upload a clear image or PDF of your report. I can help extract the test names, reported values, units, and reference ranges, then explain them in simpler language. OCR can make mistakes, so please verify the extracted values against the original report before relying on the explanation.",
    "quickReplies": [
      "Upload a report",
      "What is a reference range?",
      "Show demo report"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-27",
    "scenarioNumber": 27,
    "title": "High glucose result",
    "exampleInput": "My glucose result is high.",
    "triggers": [
      "high glucose",
      "high blood sugar",
      "glucose elevated",
      "blood sugar result"
    ],
    "keywords": [
      "high glucose",
      "high blood sugar",
      "glucose elevated",
      "blood sugar result"
    ],
    "response": "I can help you understand what the report says. Please check whether the test was fasting, random, or after a meal, and share the reported value, unit, and reference range if you want an explanation. A single result does not establish a diagnosis. A clinician should interpret it in context.",
    "quickReplies": [
      "Upload my report",
      "Explain units",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-28",
    "scenarioNumber": 28,
    "title": "High HbA1c result",
    "exampleInput": "My HbA1c is elevated.",
    "triggers": [
      "high hba1c",
      "elevated hba1c",
      "glycated hemoglobin",
      "a1c result"
    ],
    "keywords": [
      "high hba1c",
      "elevated hba1c",
      "glycated hemoglobin",
      "a1c result"
    ],
    "response": "HbA1c reflects average blood glucose over roughly the previous two to three months. The interpretation depends on the exact value, units, clinical context, and applicable guidance. Share the report if you would like help understanding the wording. Do not change medication based on this chatbot.",
    "quickReplies": [
      "Upload my report",
      "Explain HbA1c",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-29",
    "scenarioNumber": 29,
    "title": "Low hemoglobin result",
    "exampleInput": "My hemoglobin is low.",
    "triggers": [
      "low hemoglobin",
      "low hb",
      "hemoglobin result",
      "anemia report"
    ],
    "keywords": [
      "low hemoglobin",
      "low hb",
      "hemoglobin result",
      "anemia report"
    ],
    "response": "Your report may flag hemoglobin as below its reference range. Hemoglobin is a protein in red blood cells that carries oxygen. The significance depends on the exact result, units, reference range, symptoms, and medical history. I can explain the report, but a clinician must assess the cause.",
    "quickReplies": [
      "Upload my report",
      "Explain reference range",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-30",
    "scenarioNumber": 30,
    "title": "Kidney function report",
    "exampleInput": "What does my creatinine result mean?",
    "triggers": [
      "creatinine",
      "kidney function",
      "egfr",
      "renal function report"
    ],
    "keywords": [
      "creatinine",
      "kidney function",
      "egfr",
      "renal function report"
    ],
    "response": "Creatinine is a blood measurement commonly used, alongside other information, to assess kidney function. Interpretation depends on the value, unit, reference range, estimated filtration rate where available, and clinical context. Upload the report so I can help explain its recorded values without diagnosing kidney disease.",
    "quickReplies": [
      "Upload my report",
      "Explain eGFR",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-31",
    "scenarioNumber": 31,
    "title": "Cholesterol report",
    "exampleInput": "Can you explain my cholesterol results?",
    "triggers": [
      "cholesterol",
      "lipid profile",
      "ldl",
      "hdl",
      "triglycerides"
    ],
    "keywords": [
      "cholesterol",
      "lipid profile",
      "ldl",
      "hdl",
      "triglycerides"
    ],
    "response": "A lipid profile may include total cholesterol, LDL, HDL, and triglycerides. These values are interpreted together with other cardiovascular risk factors and the applicable clinical guidance. Upload your report to review the recorded values, units, and reference information.",
    "quickReplies": [
      "Upload my report",
      "Explain LDL and HDL",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-32",
    "scenarioNumber": 32,
    "title": "Thyroid test",
    "exampleInput": "What does my TSH result mean?",
    "triggers": [
      "tsh",
      "thyroid test",
      "thyroid report",
      "t3",
      "t4"
    ],
    "keywords": [
      "tsh",
      "thyroid test",
      "thyroid report",
      "t3",
      "t4"
    ],
    "response": "TSH is a hormone measurement used in evaluating thyroid function. Its interpretation may depend on the laboratory range, related thyroid tests, medicines, pregnancy status where relevant, and clinical history. Share your report if you want help understanding its wording and values.",
    "quickReplies": [
      "Upload my report",
      "Explain TSH",
      "Contact a clinician"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-33",
    "scenarioNumber": 33,
    "title": "Understanding a prescription",
    "exampleInput": "Can you read my prescription?",
    "triggers": [
      "read prescription",
      "explain prescription",
      "medicine prescription",
      "prescription OCR"
    ],
    "keywords": [
      "read prescription",
      "explain prescription",
      "medicine prescription",
      "prescription ocr"
    ],
    "response": "Upload a clear image or PDF of the prescription. I can try to extract medicine names and written instructions, then show them for verification. Handwriting and abbreviations may be misread. Confirm uncertain details with the prescribing clinician or pharmacist before taking a medicine.",
    "quickReplies": [
      "Upload prescription",
      "Prescription is handwritten",
      "Medicine safety"
    ],
    "safetyLevel": "caution",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Safe Medicine Use and Prescription Labels",
        "url": "https://medlineplus.gov/safemedicineuse.html",
        "organization": "MedlinePlus"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-34",
    "scenarioNumber": 34,
    "title": "Missed medication dose",
    "exampleInput": "I missed my medicine dose.",
    "triggers": [
      "missed dose",
      "forgot medicine",
      "forgot medication",
      "missed medication"
    ],
    "keywords": [
      "missed dose",
      "forgot medicine",
      "forgot medication",
      "missed medication"
    ],
    "response": "What to do after a missed dose depends on the specific medicine and its official instructions. Check the patient information leaflet or contact your pharmacist or prescriber. Do not double a dose unless your clinician's instructions specifically tell you to do so. I can help you locate the relevant instructions in an uploaded document.",
    "quickReplies": [
      "Find instructions in my record",
      "Contact a pharmacist"
    ],
    "safetyLevel": "caution",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Safe Medicine Administration",
        "url": "https://medlineplus.gov/safemedicineuse.html",
        "organization": "MedlinePlus"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-35",
    "scenarioNumber": 35,
    "title": "Medication side effect",
    "exampleInput": "I think my medicine is causing side effects.",
    "triggers": [
      "medicine side effects",
      "drug reaction",
      "side effects",
      "reaction to medication"
    ],
    "keywords": [
      "medicine side effects",
      "drug reaction",
      "side effects",
      "reaction to medication"
    ],
    "response": "Some symptoms may be related to medicines, but the cause cannot be confirmed from this message. If you have difficulty breathing, throat swelling, fainting, or another severe reaction, seek emergency help. Otherwise, contact your prescriber or pharmacist promptly and provide the medicine name, dose as prescribed, and when symptoms began. Do not stop essential medication without appropriate medical advice unless emergency instructions require immediate action.",
    "quickReplies": [
      "Review my prescription",
      "Possible emergency reaction",
      "Contact a pharmacist"
    ],
    "safetyLevel": "caution",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Drug Reactions and Side Effects",
        "url": "https://medlineplus.gov/drugreactions.html",
        "organization": "MedlinePlus"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-36",
    "scenarioNumber": 36,
    "title": "Drug interaction question",
    "exampleInput": "Can these two medicines be taken together?",
    "triggers": [
      "drug interaction",
      "medicine interaction",
      "can I take together",
      "mix medicines"
    ],
    "keywords": [
      "drug interaction",
      "medicine interaction",
      "can i take together",
      "mix medicines"
    ],
    "response": "Interactions depend on the exact medicine names, strengths, formulation, other medicines, and your health circumstances. I cannot safely confirm compatibility from incomplete information. Ask a pharmacist or prescriber to check the combination. You can upload your medication list to help organize the information for that review.",
    "quickReplies": [
      "Upload medication list",
      "Contact a pharmacist"
    ],
    "safetyLevel": "caution",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [
      {
        "title": "Drug Interactions Safety",
        "url": "https://medlineplus.gov/druginteractions.html",
        "organization": "MedlinePlus"
      }
    ],
    "citationStatus": "verified",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-37",
    "scenarioNumber": 37,
    "title": "Appointment preparation",
    "exampleInput": "Help me prepare for my doctor's appointment.",
    "triggers": [
      "doctor appointment",
      "prepare for appointment",
      "questions for doctor",
      "medical visit"
    ],
    "keywords": [
      "doctor appointment",
      "prepare for appointment",
      "questions for doctor",
      "medical visit"
    ],
    "response": "I can help prepare a concise visit summary using your records. We can list your main concerns, symptom timeline, current medicines as documented, allergies you report, recent test results, and questions for your clinician. You can review everything before exporting or sharing it.",
    "quickReplies": [
      "Create visit summary",
      "Review medications",
      "Review recent reports"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-38",
    "scenarioNumber": 38,
    "title": "Medical history summary",
    "exampleInput": "Summarize my medical history.",
    "triggers": [
      "medical history",
      "health summary",
      "summarize records",
      "my health profile"
    ],
    "keywords": [
      "medical history",
      "health summary",
      "summarize records",
      "my health profile"
    ],
    "response": "I can organize the records you have uploaded into a chronological health summary. It can include documented diagnoses, tests, prescriptions, and discharge information, with links to their source documents. Missing or conflicting information will be marked rather than guessed.",
    "quickReplies": [
      "Open timeline",
      "Upload a document",
      "Generate summary"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  },
  {
    "id": "scenario-39",
    "scenarioNumber": 39,
    "title": "Telugu language support",
    "exampleInput": "Explain my report in Telugu.",
    "triggers": [
      "in telugu",
      "telugu explanation",
      "తెలుగులో చెప్పండి",
      "translate report to telugu"
    ],
    "keywords": [
      "in telugu",
      "telugu explanation",
      "తెలుగులో చెప్పండి",
      "translate report to telugu"
    ],
    "response": "తప్పకుండా. మీ వైద్య నివేదికను అప్‌లోడ్ చేయండి. అందులో ఉన్న పరీక్షల పేర్లు, విలువలు, యూనిట్లు, రిఫరెన్స్ పరిధులను గుర్తించి సులభమైన తెలుగులో వివరించడానికి ప్రయత్నిస్తాను. ముఖ్యమైన విలువలను అసలు నివేదికతో సరిపోల్చి ధృవీకరించండి. ఈ వివరణ వైద్యుడి సలహాకు ప్రత్యామ్నాయం కాదు.",
    "quickReplies": [
      "Upload a report",
      "Explain in English",
      "Open health timeline"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": true,
    "teluguResponse": "తప్పకుండా. మీ వైద్య నివేదికను అప్‌లోడ్ చేయండి. అందులో ఉన్న పరీక్షల పేర్లు, విలువలు, యూనిట్లు, రిఫరెన్స్ పరిధులను గుర్తించి సులభమైన తెలుగులో వివరించడానికి ప్రయత్నిస్తాను. ముఖ్యమైన విలువలను అసలు నివేదికతో సరిపోల్చి ధృవీకరించండి. ఈ వివరణ వైద్యుడి సలహాకు ప్రత్యామ్నాయం కాదు."
  },
  {
    "id": "scenario-40",
    "scenarioNumber": 40,
    "title": "Unknown question or unsupported request",
    "exampleInput": "Can you help me with something else?",
    "triggers": [
      "Default fallback for unmatched messages."
    ],
    "keywords": [
      "default fallback for unmatched messages."
    ],
    "response": "I can help you understand uploaded medical records, review laboratory report wording, read supported printed prescriptions, summarize your health timeline, or prepare questions for a clinician. I cannot diagnose a condition, prescribe treatment, or reliably interpret every handwritten document. What would you like help with?",
    "quickReplies": [
      "Explain a lab report",
      "Read a prescription",
      "Summarize my records",
      "General symptom information"
    ],
    "safetyLevel": "routine",
    "disclaimer": "Educational guidance only. Not a medical diagnosis or prescription. Consult a licensed physician for personal care.",
    "sourceCitations": [],
    "citationStatus": "unspecified_in_source",
    "hasTeluguTranslation": false
  }
];

export const SCENARIO_MAP: Record<string, ChatScenario> = Object.fromEntries(
  HEALTH_CHAT_SCENARIOS.map((s) => [s.id, s])
);

export function getScenarioById(id: string): ChatScenario | undefined {
  return SCENARIO_MAP[id];
}

export function getScenarioByNumber(num: number): ChatScenario | undefined {
  const pad = num.toString().padStart(2, '0');
  return SCENARIO_MAP[`scenario-${pad}`];
}
