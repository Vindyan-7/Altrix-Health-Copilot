import { HEALTH_GUIDES_EN } from '../../data/health-guides-en';
import { HEALTH_GUIDES_TE } from '../../data/health-guides-te';
import type { HealthGuide, IntentMatchResult, SupportedLocale } from '../../data/health-guide-types';

/**
 * Deterministic Intent & Safety Router Engine
 * Evaluates queries against emergency red-flags, dosage restrictions, and supported health guides.
 * Completely autonomous: requires no external API keys, no network calls, and no auth.
 */

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
  'severe bleeding',
  'choking',
  'cardiac arrest',
  'emergency',
  'dying',
  'suicide',
  'blue lips',
  // Telugu
  'గుండెపోటు',
  'ఛాతీ నొప్పి',
  'శ్వాస ఆడట్లేదు',
  'శ్వాస ఇబ్బంది',
  'పక్షవాతం',
  'స్పృహ లేదు',
  'రక్తస్రావం',
  'ఎమర్జెన్సీ',
];

// Individualized Dosage Keywords (Strictly Intercepted)
const DOSING_KEYWORDS = [
  'how much should i take',
  'how many tablets',
  'what dose',
  'dosage for my child',
  'dose for 5 year old',
  'can i take 1000mg',
  'stop taking my',
  'increase dose',
  'double the dose',
  'ఎంత డోస్',
  'ఎన్ని మాత్రలు',
  'పిల్లలకి ఎంత ఇవ్వాలి',
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
    const guide = getGuideById('emergency-signs', locale);
    return {
      matched: true,
      intent: 'emergency_red_flag',
      guide,
      isEmergency: true,
      confidence: 'high',
    };
  }

  // Gate 2: Block Individualized Dosing / Drug Prescription Changes
  const isDosing = DOSING_KEYWORDS.some((kw) => query.includes(kw));
  if (isDosing) {
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
    { id: 'emergency-signs', label: 'Emergency Red Flags' },
    { id: 'cpr', label: 'Hands-Only CPR' },
    { id: 'medicine-info', label: 'Medicine Safety' },
  ];
}
