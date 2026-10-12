import { normalizeInput, matchesWordBoundary } from './normalizeInput';
import type { ChatIntentMatch, SourceCitation } from '../../types/healthChat';

const EMERGENCY_CITATIONS: SourceCitation[] = [
  {
    title: 'India National Emergency Services 112',
    url: 'https://112.gov.in',
    organization: 'Emergency Response Support System (India)',
  },
  {
    title: 'Recognizing Medical Emergencies',
    url: 'https://medlineplus.gov/emergencymedicalservices.html',
    organization: 'MedlinePlus',
  },
];

/**
 * Emergency red-flag trigger patterns
 */
const EMERGENCY_TRIGGERS: string[] = [
  'chest pain',
  'chest pressure',
  'tight chest',
  'chest heaviness',
  'heart attack',
  'shortness of breath',
  'difficulty breathing',
  'cannot breathe',
  'cant breathe',
  'gasping',
  'struggling to breathe',
  'face drooping',
  'face is drooping',
  'facial droop',
  'drooping face',
  'slurred speech',
  'speech is slurred',
  'speech slurred',
  'sudden weakness',
  'stroke',
  'stroke symptoms',
  'cannot speak',
  'cant speak',
  'severe bleeding',
  'heavy bleeding',
  'bleeding will not stop',
  'large blood loss',
  'throat swelling',
  'tongue swelling',
  'anaphylaxis',
  'severe allergic reaction',
  'unconscious',
  'fainted',
  'seizure',
  'severe confusion',
  'suicide',
  'self harm',
  // Telugu emergency indicators
  'గుండె నొప్పి',
  'శ్వాస ఆడటం లేదు',
  'శ్వాస తీసుకోవడంలో ఇబ్బంది',
  'రక్తస్రావం ఆగడం లేదు',
  'రక్తం కారుతోంది',
  'పక్షవాతం',
  'స్పృహ కోల్పోవడం',
];

/**
 * Evaluates whether input contains an immediate life-threatening emergency.
 * Priority 1: ALWAYS executed before routine scenario matching.
 */
export function checkEmergency(input: string): ChatIntentMatch | null {
  const normalized = normalizeInput(input);
  if (!normalized) return null;

  for (const trigger of EMERGENCY_TRIGGERS) {
    if (matchesWordBoundary(normalized, trigger) || input.toLowerCase().includes(trigger.toLowerCase())) {
      return {
        type: 'emergency',
        confidence: 1.0,
        matchedTrigger: trigger,
        isEmergency: true,
        safetyLevel: 'urgent',
        message:
          'EMERGENCY WARNING: The symptoms you described may require immediate medical attention. Please call emergency services right away:\n\n' +
          '• India: Call 112 or 108 immediately\n' +
          '• United States: Call 911\n\n' +
          'Do not wait or continue using this chatbot to assess the cause. If someone nearby can assist, alert them immediately.',
        quickReplies: ['Call 112 / 108 (India)', 'Call 911 (US)', 'I am safe, show routine guidance'],
        disclaimer: 'CRITICAL EMERGENCY ADVISORY: This digital assistant cannot diagnose emergencies or provide life support. Contact emergency services now.',
        citations: EMERGENCY_CITATIONS,
      };
    }
  }

  return null;
}
