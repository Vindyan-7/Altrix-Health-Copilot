import { normalizeInput, matchesWordBoundary } from './normalizeInput';
import { checkEmergency } from './routeEmergency';
import { checkDosageInterception } from './safetyRules';
import { HEALTH_CHAT_SCENARIOS, getScenarioById } from '../../data/healthChatScenarios';
import type { ChatIntentMatch, ChatScenario, SourceCitation } from '../../types/healthChat';

interface ScoredScenario {
  scenario: ChatScenario;
  score: number;
  matchedTrigger: string;
}

const FALLBACK_CITATIONS: SourceCitation[] = [
  {
    title: 'MedlinePlus Health Topics',
    url: 'https://medlineplus.gov',
    organization: 'MedlinePlus (National Library of Medicine)',
  },
];

/**
 * Deterministic intent matcher with emergency priority, disambiguation,
 * and context retention for quick replies and short follow-ups.
 */
export function matchIntent(
  rawInput: string,
  activeScenarioId?: string,
  locale: 'en' | 'te' = 'en'
): ChatIntentMatch {
  // 1. Emergency Precedence (Priority 1)
  const emergency = checkEmergency(rawInput);
  if (emergency) {
    return emergency;
  }

  // 2. Medication Dosage Safety (Priority 2)
  const dosage = checkDosageInterception(rawInput);
  if (dosage) {
    return dosage;
  }

  const normalized = normalizeInput(rawInput);
  if (!normalized) {
    const fallbackScenario = getScenarioById('scenario-40')!;
    return {
      type: 'fallback',
      scenario: fallbackScenario,
      confidence: 0,
      message: fallbackScenario.response,
      quickReplies: fallbackScenario.quickReplies,
      safetyLevel: 'routine',
      isEmergency: false,
      disclaimer: fallbackScenario.disclaimer || '',
      citations: fallbackScenario.sourceCitations.length > 0 ? fallbackScenario.sourceCitations : FALLBACK_CITATIONS,
    };
  }

  // 3. Context Retention: Follow-up check within active scenario
  if (activeScenarioId) {
    const active = getScenarioById(activeScenarioId);
    if (active) {
      // Check if input matches one of active scenario's quick replies
      const matchedQuickReply = active.quickReplies.find(
        (qr) => normalizeInput(qr) === normalized || normalized.includes(normalizeInput(qr))
      );

      if (matchedQuickReply) {
        return buildContextualFollowUpMatch(active, matchedQuickReply, locale);
      }

      // Check common short duration/progression follow-ups
      if (
        normalized.match(/\b(\d+|one|two|three|four|five|several)\s*(days?|weeks?|months?|hours?)\b/) ||
        normalized === 'mild' ||
        normalized === 'moderate' ||
        normalized === 'severe'
      ) {
        return {
          type: 'scenario',
          scenario: active,
          confidence: 0.9,
          matchedTrigger: `followup_${normalized}`,
          message:
            `Thank you for providing that detail regarding ${active.title.toLowerCase()} (${rawInput.trim()}).\n\n` +
            `• If symptoms are mild and stable, continue resting, hydrating, and monitoring for any new red flags.\n` +
            `• If symptoms have persisted for several days or are worsening, schedule an evaluation with your healthcare provider.\n` +
            `• Any sudden severe symptoms require immediate urgent care.`,
          quickReplies: active.quickReplies,
          safetyLevel: active.safetyLevel,
          isEmergency: false,
          disclaimer: active.disclaimer || '',
          citations: active.sourceCitations.length > 0 ? active.sourceCitations : FALLBACK_CITATIONS,
          contextScenarioId: active.id,
        };
      }
    }
  }

  // 4. Score all 40 scenarios against input
  const scored: ScoredScenario[] = [];

  for (const scenario of HEALTH_CHAT_SCENARIOS) {
    if (scenario.id === 'scenario-40') continue; // Scenario 40 is default fallback

    let bestScore = 0;
    let bestTrigger = '';

    for (const trigger of scenario.triggers) {
      const normTrigger = normalizeInput(trigger);
      if (!normTrigger) continue;

      if (normalized === normTrigger) {
        // Exact full match
        bestScore = Math.max(bestScore, 1.0);
        bestTrigger = trigger;
      } else if (matchesWordBoundary(normalized, normTrigger)) {
        // Exact substring with word boundaries
        const coverageRatio = normTrigger.length / Math.max(normalized.length, 1);
        const score = 0.75 + Math.min(0.2, coverageRatio * 0.2);
        if (score > bestScore) {
          bestScore = score;
          bestTrigger = trigger;
        }
      } else {
        // Token-level overlap
        const triggerTokens = normTrigger.split(' ');
        const inputTokens = new Set(normalized.split(' '));
        const matchedTokens = triggerTokens.filter((t) => inputTokens.has(t));
        if (matchedTokens.length > 0 && triggerTokens.length > 1) {
          const ratio = matchedTokens.length / triggerTokens.length;
          const score = ratio * 0.6;
          if (score > bestScore && score >= 0.5) {
            bestScore = score;
            bestTrigger = trigger;
          }
        }
      }
    }

    if (bestScore > 0) {
      scored.push({
        scenario,
        score: bestScore,
        matchedTrigger: bestTrigger,
      });
    }
  }

  // Sort by highest confidence score
  scored.sort((a, b) => b.score - a.score);

  // 5. Ambiguity & Disambiguation Handling
  // If top 2 matches have high scores within 0.15 of each other, ask user to clarify
  if (
    scored.length >= 2 &&
    scored[0].score >= 0.6 &&
    scored[1].score >= 0.6 &&
    Math.abs(scored[0].score - scored[1].score) <= 0.15 &&
    scored[0].scenario.id !== scored[1].scenario.id
  ) {
    const candidates = scored.slice(0, 3).map((s) => s.scenario);
    return {
      type: 'disambiguation',
      candidateScenarios: candidates,
      confidence: scored[0].score,
      matchedTrigger: `${scored[0].matchedTrigger} | ${scored[1].matchedTrigger}`,
      message:
        `Your question could relate to a few different health topics: **${candidates.map((c) => c.title).join('**, **')}**.\n\n` +
        `Which specific topic would you like to explore first?`,
      quickReplies: candidates.map((c) => c.title),
      safetyLevel: 'routine',
      isEmergency: false,
      disclaimer: 'Please choose the topic that best matches your primary concern.',
      citations: FALLBACK_CITATIONS,
    };
  }

  // 6. Confident Single Match
  if (scored.length > 0 && scored[0].score >= 0.5) {
    const top = scored[0].scenario;
    return buildScenarioMatch(top, scored[0].score, scored[0].matchedTrigger, locale);
  }

  // 7. Fallback to Scenario 40
  const fallbackScenario = getScenarioById('scenario-40')!;
  return {
    type: 'fallback',
    scenario: fallbackScenario,
    confidence: 0,
    matchedTrigger: 'default_fallback',
    message: fallbackScenario.response,
    quickReplies: fallbackScenario.quickReplies,
    safetyLevel: 'routine',
    isEmergency: false,
    disclaimer: fallbackScenario.disclaimer || '',
    citations: fallbackScenario.sourceCitations.length > 0 ? fallbackScenario.sourceCitations : FALLBACK_CITATIONS,
    contextScenarioId: undefined,
  };
}

function buildScenarioMatch(
  scenario: ChatScenario,
  confidence: number,
  matchedTrigger: string,
  locale: 'en' | 'te'
): ChatIntentMatch {
  const isTeluguRequested = locale === 'te';
  let message = scenario.response;

  // Honest representation of language translation
  if (isTeluguRequested) {
    if (scenario.hasTeluguTranslation && scenario.teluguResponse) {
      message = scenario.teluguResponse;
    } else {
      message =
        `[తెలుగు అనువాదం క్లినికల్ సమీక్షలో ఉంది / Translation pending clinical review]\n\n` +
        scenario.response;
    }
  }

  const isEmergency = scenario.safetyLevel === 'urgent';
  return {
    type: isEmergency ? 'emergency' : 'scenario',
    scenario,
    confidence,
    matchedTrigger,
    message,
    quickReplies: scenario.quickReplies,
    safetyLevel: scenario.safetyLevel,
    isEmergency,
    disclaimer: scenario.disclaimer || 'Educational guidance only. Consult a clinician.',
    citations: scenario.sourceCitations.length > 0 ? scenario.sourceCitations : FALLBACK_CITATIONS,
    contextScenarioId: scenario.id,
  };
}

function buildContextualFollowUpMatch(
  active: ChatScenario,
  quickReply: string,
  locale: 'en' | 'te'
): ChatIntentMatch {
  let followUpMessage = '';
  const normQR = normalizeInput(quickReply);

  if (normQR.includes('warning') || normQR.includes('emergency')) {
    followUpMessage =
      `Important warning signs for ${active.title.toLowerCase()}:\n\n` +
      `• High, unremitting symptoms or sudden rapid deterioration.\n` +
      `• Difficulty breathing, chest tightness, severe confusion, or fainting.\n` +
      `• Inability to keep fluids down or signs of marked dehydration.\n\n` +
      `If any of these are present, seek urgent medical assessment immediately (Call 112 in India or 911 in US).`;
  } else if (normQR.includes('how long') || normQR.includes('duration')) {
    followUpMessage =
      `Monitoring duration for ${active.title.toLowerCase()}:\n\n` +
      `• Track when symptoms first appeared and note whether they are improving, stable, or worsening.\n` +
      `• Most mild viral symptoms begin improving within several days. Symptoms that persist beyond 5–7 days or worsen after initial improvement warrant a physician evaluation.\n` +
      `• Document daily temperatures or symptom frequency to share with your doctor.`;
  } else if (normQR.includes('contact') || normQR.includes('clinician') || normQR.includes('doctor')) {
    followUpMessage =
      `When to see a doctor for ${active.title.toLowerCase()}:\n\n` +
      `• Any red-flag warning signs or symptoms lasting longer than expected.\n` +
      `• Symptoms in young children, elderly individuals, or people with chronic health conditions.\n` +
      `• If symptoms interfere with sleeping, eating, or normal daily activities.`;
  } else {
    followUpMessage =
      `Detailed context on ${quickReply} regarding ${active.title.toLowerCase()}:\n\n` +
      `• Keep a log of your symptoms, duration, and any home care measures you have attempted.\n` +
      `• Rest, stay hydrated, and avoid strenuous activity while monitoring your condition.\n` +
      `• Share this record with your clinician during your next visit.`;
  }

  return {
    type: 'scenario',
    scenario: active,
    confidence: 0.95,
    matchedTrigger: `quick_reply:${quickReply}`,
    message: followUpMessage,
    quickReplies: active.quickReplies.filter((qr) => qr !== quickReply),
    safetyLevel: active.safetyLevel,
    isEmergency: false,
    disclaimer: active.disclaimer || '',
    citations: active.sourceCitations.length > 0 ? active.sourceCitations : FALLBACK_CITATIONS,
    contextScenarioId: active.id,
  };
}
