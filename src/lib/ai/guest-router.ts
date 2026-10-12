import { HEALTH_GUIDES_EN } from '../../data/health-guides-en';
import { HEALTH_GUIDES_TE } from '../../data/health-guides-te';
import type { HealthGuide, IntentMatchResult, SupportedLocale } from '../../data/health-guide-types';

/**
 * Deterministic Intent & Safety Router Engine
 * Evaluates queries against emergency red-flags, dosage restrictions, and supported health guides.
 * Completely autonomous: requires no external API keys, no network calls, and no auth.
 */

// Severe Bleeding Keywords (English & Telugu)
const SEVERE_BLEEDING_KEYWORDS = [
  'severe bleeding',
  'uncontrolled bleeding',
  'spurting blood',
  'bleeding heavily',
  'heavy blood loss',
  'hemorrhage',
  'తీవ్ర రక్తస్రావం',
  'ఆగని రక్తస్రావం',
  'ఎక్కువ రక్తస్రావం',
  'రక్తం ఆగట్లేదు',
];

// Emergency Red-Flag Keywords (English & Telugu)
const EMERGENCY_KEYWORDS = [
  // English
  'chest pain',
  'heart attack',
  'cannot breathe',
  'difficulty breathing',
  'shortness of breath',
  'stroke',
  'face drooping',
  'arm weakness',
  'slurred speech',
  'unconscious',
  'passed out',
  'fainted',
  'choking',
  'cardiac arrest',
  'emergency',
  'dying',
  'suicide',
  'blue lips',
  ...SEVERE_BLEEDING_KEYWORDS,
  // Telugu
  'గుండెపోటు',
  'ఛాతీ నొప్పి',
  'శ్వాస ఆడట్లేదు',
  'శ్వాస ఇబ్బంది',
  'పక్షవాతం',
  'స్పృహ లేదు',
  'ఎమర్జెన్సీ',
];

// Individualized Dosage & Ambiguous Medication Safety Keywords (Strictly Intercepted)
const DOSING_AND_SAFETY_KEYWORDS = [
  // Specific dosage / quantity / titration
  'how much should i take',
  'how much can i take',
  'how much to take',
  'how many tablets',
  'how many pills',
  'what dose',
  'what is the dose',
  'what is the dosage',
  'dosage for',
  'dose for',
  'daily dose',
  'can i take 500mg',
  'can i take 650mg',
  'can i take 1000mg',
  'how many mg',
  'stop taking my',
  'increase dose',
  'double the dose',
  'skip a dose',
  'dosage calculation',
  // Ambiguous safety guarantees & drug interactions
  '100% safe',
  'safe to take',
  'is it safe',
  'universal safety',
  'completely safe',
  'is it safe in pregnancy',
  'safe while pregnant',
  'safe in pregnancy',
  'safe for pregnancy',
  'safe for children',
  'safe for child',
  'can i mix',
  'can i combine',
  'take together',
  'drug interaction',
  'can i take with',
  // Telugu
  'ఎంత డోస్',
  'ఎంత మోతాదు',
  'ఎన్ని మాత్రలు',
  'పిల్లలకి ఎంత ఇవ్వాలి',
  'గర్భధారణలో సురక్షితమేనా',
  'కలిపి వేసుకోవచ్చా',
  'డైలీ డోస్',
  'ఎంత తీసుకోవాలి',
  '100% సేఫ్',
  'పూర్తిగా సురక్షితమేనా',
];

// Topic Keyword Maps (Case-insensitive multi-keyword matches)
interface TopicMatcher {
  id: string;
  keywords: string[];
}

const TOPIC_MATCHERS: TopicMatcher[] = [
  {
    id: 'emergency-signs',
    keywords: [
      'heart attack signs',
      'stroke signs',
      'fast test',
      'warning signs of stroke',
      'chest tightness warning',
      'గుండెపోటు లక్షణాలు',
      'పక్షవాతం సంకేతాలు',
    ],
  },
  {
    id: 'cpr',
    keywords: [
      'cpr',
      'chest compressions',
      'cardiopulmonary',
      'save someone',
      'unresponsive person',
      'first aid cpr',
      'సిపిఆర్',
      'ఛాతీ నొక్కడం',
    ],
  },
  {
    id: 'fever',
    keywords: [
      'fever',
      'high temperature',
      'feeling hot',
      'chills',
      'febrile',
      'temperature 101',
      'temperature 102',
      'temperature 100',
      'జ్వరం',
      'ఒళ్ళు వెచ్చగా',
      'చలి జ్వరం',
    ],
  },
  {
    id: 'cold-cough',
    keywords: [
      'cold',
      'cough',
      'coughing',
      'runny nose',
      'blocked nose',
      'congestion',
      'sore throat',
      'sneezing',
      'phlegm',
      'జలుబు',
      'దగ్గు',
      'ముక్కు కారడం',
      'గొంతు నొప్పి',
    ],
  },
  {
    id: 'headache',
    keywords: [
      'headache',
      'migraine',
      'head pain',
      'throbbing head',
      'tension headache',
      'scalp pain',
      'తలనొప్పి',
      'మైగ్రేన్',
      'తల బరువుగా',
    ],
  },
  {
    id: 'stomach-pain',
    keywords: [
      'stomach pain',
      'abdominal pain',
      'belly ache',
      'tummy pain',
      'cramps',
      'indigestion',
      'gas pain',
      'stomach upset',
      'కడుపు నొప్పి',
      'కడుపు ఉబ్బరం',
      'అజీర్ణం',
    ],
  },
  {
    id: 'medicine-info',
    keywords: [
      'paracetamol',
      'acetaminophen',
      'dolo',
      'crocin',
      'medicine info',
      'painkiller',
      'safe medicine',
      'ibuprofen warning',
      'మందులు',
      'పారాసిటమాల్',
      'డోలో',
    ],
  },
  {
    id: 'wellness',
    keywords: [
      'wellness',
      'healthy habits',
      'hydration',
      'how much water',
      'sleep habits',
      'exercise per week',
      'prevention',
      'మంచి అలవాట్లు',
      'ఆరోగ్యం',
      'నీరు ఎంత తాగాలి',
    ],
  },
  {
    id: 'bleeding-first-aid',
    keywords: [
      'bleeding',
      'blood',
      'cut',
      'scrape',
      'wound',
      'minor bleeding',
      'nosebleed',
      'gauze',
      'bandage',
      'రక్తస్రావం',
      'రక్తం',
      'గాయం',
      'దెబ్బ',
      'రక్తం కారుతోంది',
      'చిన్న గాయం',
      'ముక్కులో రక్తం',
    ],
  },
];

/**
 * Evaluates a user message against safety gates and topic catalogue.
 */
export function routeGuestQuery(
  rawQuery: string,
  locale: SupportedLocale = 'en'
): IntentMatchResult {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return {
      matched: false,
      intent: 'empty',
      isEmergency: false,
      confidence: 'none',
      suggestedTopics: getFeaturedTopicSuggestions(locale),
    };
  }

  // Gate 1: Deterministic Emergency Red Flag Detection
  const hasEmergency = EMERGENCY_KEYWORDS.some((kw) => query.includes(kw));
  if (hasEmergency) {
    const isSevereBleeding = SEVERE_BLEEDING_KEYWORDS.some((kw) => query.includes(kw));
    const guideId = isSevereBleeding ? 'bleeding-first-aid' : 'emergency-signs';
    const guide = getGuideById(guideId, locale);
    return {
      matched: true,
      intent: 'emergency_red_flag',
      guide,
      isEmergency: true,
      confidence: 'high',
    };
  }

  // Gate 2: Block Individualized Dosing & Ambiguous Medication Safety / Interactions
  const isDosingOrSafety = DOSING_AND_SAFETY_KEYWORDS.some((kw) => query.includes(kw));
  if (isDosingOrSafety) {
    const guide = getGuideById('medicine-info', locale);
    return {
      matched: true,
      intent: 'blocked_dosage_request',
      guide,
      isEmergency: false,
      confidence: 'high',
    };
  }

  // Gate 3: Match Curated Topic Catalogue
  for (const matcher of TOPIC_MATCHERS) {
    const isMatch = matcher.keywords.some((kw) => query.includes(kw));
    if (isMatch) {
      const guide = getGuideById(matcher.id, locale);
      return {
        matched: true,
        intent: matcher.id,
        guide,
        isEmergency: false,
        confidence: 'high',
      };
    }
  }

  // Gate 4: Unsupported Query (Explicit Limitation & Choices)
  return {
    matched: false,
    intent: 'unsupported_query',
    isEmergency: false,
    confidence: 'none',
    suggestedTopics: getFeaturedTopicSuggestions(locale),
  };
}

/**
 * Retrieves a health guide by ID in the requested locale, falling back to English if missing.
 */
export function getGuideById(
  id: string,
  locale: SupportedLocale = 'en'
): HealthGuide | undefined {
  if (locale === 'te' && HEALTH_GUIDES_TE[id]) {
    return HEALTH_GUIDES_TE[id];
  }
  return HEALTH_GUIDES_EN[id];
}

/**
 * Returns featured quick-reply topic pills for guest navigation.
 */
export function getFeaturedTopicSuggestions(
  locale: SupportedLocale = 'en'
): Array<{ id: string; label: string }> {
  if (locale === 'te') {
    return [
      { id: 'fever', label: 'జ్వరం సంరక్షణ' },
      { id: 'cold-cough', label: 'జలుబు & దగ్గు' },
      { id: 'headache', label: 'తలనొప్పి' },
      { id: 'stomach-pain', label: 'కడుపు నొప్పి' },
      { id: 'bleeding-first-aid', label: 'గాయాలు & రక్తస్రావం' },
      { id: 'emergency-signs', label: 'అత్యవసర సంకేతాలు (112)' },
      { id: 'cpr', label: 'CPR ప్రథమ చికిత్స' },
      { id: 'medicine-info', label: 'మందుల సమాచారం' },
    ];
  }

  return [
    { id: 'fever', label: 'Fever Guidance' },
    { id: 'cold-cough', label: 'Cold & Cough' },
    { id: 'headache', label: 'Headache & Migraine' },
    { id: 'stomach-pain', label: 'Stomach Pain' },
    { id: 'bleeding-first-aid', label: 'Bleeding & First Aid' },
    { id: 'emergency-signs', label: 'Emergency Red Flags' },
    { id: 'cpr', label: 'Hands-Only CPR' },
    { id: 'medicine-info', label: 'Medicine Safety' },
  ];
}

