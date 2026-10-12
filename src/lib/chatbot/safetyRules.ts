import { normalizeInput } from './normalizeInput';
import type { ChatIntentMatch, SourceCitation } from '../../types/healthChat';

const MEDICATION_CITATIONS: SourceCitation[] = [
  {
    title: 'Safe Medicine Use and Prescription Labels',
    url: 'https://medlineplus.gov/safemedicineuse.html',
    organization: 'MedlinePlus',
  },
];

const DOSAGE_TRIGGERS: string[] = [
  'how much dose',
  'how many mg',
  'how many tablets',
  'how many pills',
  'what dose should i take',
  'can i take 500mg',
  'can i take 650mg',
  'can i take 1000mg',
  'dose for child',
  'dosage for baby',
  'child dose',
  'increase my dose',
  'double the dose',
  'change my medicine dose',
  'prescribe me',
  // Telugu
  'ఎంత మోతాదు',
  'ఎన్ని టాబ్లెట్లు',
  'డోస్ ఎంత',
];

/**
 * Checks for medication dosage questions and intercepts them safely.
 * Priority 2: Precedes routine scenario matching.
 */
export function checkDosageInterception(input: string): ChatIntentMatch | null {
  const normalized = normalizeInput(input);
  if (!normalized) return null;

  for (const trigger of DOSAGE_TRIGGERS) {
    if (normalized.includes(normalizeInput(trigger)) || input.toLowerCase().includes(trigger.toLowerCase())) {
      return {
        type: 'dosage_interception',
        confidence: 1.0,
        matchedTrigger: trigger,
        isEmergency: false,
        safetyLevel: 'caution',
        message:
          'MEDICATION SAFETY NOTICE: Altrix Health Copilot cannot recommend specific drug dosages, calculate medication amounts, or adjust prescriptions. ' +
          'Safe dosing depends on age, kidney function, weight, other medications, and specific clinical diagnosis.\n\n' +
          '• Please refer strictly to the packaging leaflet or the prescription label written by your physician.\n' +
          '• Consult your local pharmacist or prescribing doctor before altering any medication.',
        quickReplies: ['Read prescription guidelines', 'Contact a pharmacist', 'Explain general medicine safety'],
        disclaimer: 'MEDICATION SAFETY ADVISORY: Never alter or start prescription doses without direct clinical consultation.',
        citations: MEDICATION_CITATIONS,
      };
    }
  }

  return null;
}
