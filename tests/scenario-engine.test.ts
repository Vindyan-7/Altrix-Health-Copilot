import { describe, it, expect, beforeEach } from 'vitest';
import { HEALTH_CHAT_SCENARIOS, getScenarioById, getScenarioByNumber } from '../src/data/healthChatScenarios';
import { matchIntent } from '../src/lib/chatbot/matchIntent';
import { normalizeInput, matchesWordBoundary } from '../src/lib/chatbot/normalizeInput';
import { checkEmergency } from '../src/lib/chatbot/routeEmergency';
import { checkDosageInterception } from '../src/lib/chatbot/safetyRules';
import { ConversationEngine, MAX_GUEST_TURNS } from '../src/lib/chatbot/conversationEngine';

describe('Phase 4A: 40-Scenario Engine & Quality Gates', () => {
  describe('1. Scenario Registry Completeness & Integrity', () => {
    it('contains exactly 40 predefined scenarios with canonical IDs', () => {
      expect(HEALTH_CHAT_SCENARIOS).toHaveLength(40);

      for (let i = 1; i <= 40; i++) {
        const pad = i.toString().padStart(2, '0');
        const id = `scenario-${pad}`;
        const scenario = getScenarioById(id);

        expect(scenario).toBeDefined();
        expect(scenario?.id).toBe(id);
        expect(scenario?.scenarioNumber).toBe(i);
        expect(scenario?.title.trim().length).toBeGreaterThan(0);
        expect(scenario?.response.trim().length).toBeGreaterThan(0);
        expect(scenario?.triggers.length).toBeGreaterThan(0);
        expect(scenario?.quickReplies.length).toBeGreaterThan(0);
      }
    });

    it('getScenarioByNumber correctly resolves scenarios 1 through 40', () => {
      expect(getScenarioByNumber(1)?.id).toBe('scenario-01');
      expect(getScenarioByNumber(21)?.id).toBe('scenario-21');
      expect(getScenarioByNumber(40)?.id).toBe('scenario-40');
    });

    it('correctly maps safety levels (urgent, caution, routine)', () => {
      // Scenarios 21-25 are URGENT emergencies
      for (let i = 21; i <= 25; i++) {
        const sc = getScenarioByNumber(i);
        expect(sc?.safetyLevel).toBe('urgent');
      }

      // Prescription / medication scenarios are caution
      for (let i = 33; i <= 36; i++) {
        const sc = getScenarioByNumber(i);
        expect(sc?.safetyLevel).toBe('caution');
      }

      // Routine scenarios
      expect(getScenarioByNumber(1)?.safetyLevel).toBe('routine');
      expect(getScenarioByNumber(5)?.safetyLevel).toBe('routine');
    });

    it('flags citation completeness honestly without inventing missing URLs', () => {
      const fever = getScenarioById('scenario-01')!;
      expect(fever.citationStatus).toBe('verified');
      expect(fever.sourceCitations.length).toBeGreaterThan(0);

      // Scenarios where raw markdown did not include links are flagged as unspecified_in_source
      const fatigue = getScenarioById('scenario-12')!;
      expect(fatigue.citationStatus).toBe('unspecified_in_source');
      expect(fatigue.sourceCitations).toHaveLength(0);
    });

    it('flags language translation coverage honestly', () => {
      const teluguSc = getScenarioById('scenario-39')!;
      expect(teluguSc.hasTeluguTranslation).toBe(true);
      expect(teluguSc.teluguResponse).toContain('తప్పకుండా');

      const headache = getScenarioById('scenario-02')!;
      expect(headache.hasTeluguTranslation).toBe(false);
    });
  });

  describe('2. Input Normalization & Word-Boundary Matching', () => {
    it('normalizes uppercase, punctuation, and multiple spaces', () => {
      expect(normalizeInput('  I HAVE A FEVER!??  ')).toBe('i have a fever');
      expect(normalizeInput('Chest    pain, tightness...')).toBe('chest pain tightness');
    });

    it('matches word boundaries without false positive substring matches', () => {
      expect(matchesWordBoundary('i have a fever today', 'fever')).toBe(true);
      // 'pain' should not match 'painting' or 'spain'
      expect(matchesWordBoundary('i enjoy painting', 'pain')).toBe(false);
      expect(matchesWordBoundary('i visited spain', 'pain')).toBe(false);
      expect(matchesWordBoundary('i have knee pain', 'pain')).toBe(true);
    });
  });

  describe('3. Priority 1: Emergency Precedence', () => {
    it('intercepts chest pain as an emergency ahead of routine scenario matching', () => {
      const match = matchIntent('I have severe chest pain and tight chest');
      expect(match.type).toBe('emergency');
      expect(match.isEmergency).toBe(true);
      expect(match.safetyLevel).toBe('urgent');
      expect(match.message).toContain('EMERGENCY WARNING');
      expect(match.message).toContain('112');
    });

    it('intercepts stroke symptoms as an emergency', () => {
      const match = matchIntent('My face is drooping and my speech is slurred');
      expect(match.type).toBe('emergency');
      expect(match.isEmergency).toBe(true);
      expect(match.safetyLevel).toBe('urgent');
    });

    it('intercepts severe bleeding as an emergency', () => {
      const match = matchIntent('The bleeding will not stop');
      expect(match.type).toBe('emergency');
      expect(match.isEmergency).toBe(true);
      expect(match.safetyLevel).toBe('urgent');
    });

    it('intercepts Telugu emergency phrases', () => {
      const match = matchIntent('నాకు విపరీతమైన గుండె నొప్పి వస్తోంది');
      expect(match.type).toBe('emergency');
      expect(match.isEmergency).toBe(true);
    });
  });

  describe('4. Priority 2: Medication Dosage Interception', () => {
    it('intercepts dosage questions with deterministic refusal', () => {
      const match = matchIntent('How many mg of paracetamol can I take?');
      expect(match.type).toBe('dosage_interception');
      expect(match.isEmergency).toBe(false);
      expect(match.safetyLevel).toBe('caution');
      expect(match.message).toContain('MEDICATION SAFETY NOTICE');
      expect(match.message).toContain('cannot recommend specific drug dosages');
    });

    it('intercepts pill count and double dose questions', () => {
      const match1 = matchIntent('Can I take 500mg tablets?');
      expect(match1.type).toBe('dosage_interception');

      const match2 = matchIntent('Should I double the dose for my child?');
      expect(match2.type).toBe('dosage_interception');
    });
  });

  describe('5. Routine Intent Matching Across Representative Scenarios', () => {
    it('matches Scenario 01 (Fever)', () => {
      const match = matchIntent('I have a high temperature and feeling feverish');
      expect(match.type).toBe('scenario');
      expect(match.scenario?.id).toBe('scenario-01');
      expect(match.scenario?.title).toBe('Fever');
      expect(match.quickReplies).toContain('How long should I monitor it?');
    });

    it('matches Scenario 02 (Headache)', () => {
      const match = matchIntent('My head hurts and I have a bad headache');
      expect(match.type).toBe('scenario');
      expect(match.scenario?.id).toBe('scenario-02');
    });

    it('matches Scenario 09 (Abdominal pain)', () => {
      const match = matchIntent('My stomach hurts with abdominal pain');
      expect(match.type).toBe('scenario');
      expect(match.scenario?.id).toBe('scenario-09');
    });

    it('matches Scenario 28 (High HbA1c result)', () => {
      const match = matchIntent('Can you explain my high hba1c report?');
      expect(match.type).toBe('scenario');
      expect(match.scenario?.id).toBe('scenario-28');
    });

    it('matches Scenario 33 (Prescription reading)', () => {
      const match = matchIntent('Can you read my prescription?');
      expect(match.type).toBe('scenario');
      expect(match.scenario?.id).toBe('scenario-33');
    });

    it('falls back to Scenario 40 on completely unknown or nonsensical query', () => {
      const match = matchIntent('Quantum teleportation algorithm in python');
      expect(match.type).toBe('fallback');
      expect(match.scenario?.id).toBe('scenario-40');
      expect(match.quickReplies).toContain('Explain a lab report');
    });
  });

  describe('6. Disambiguation for Overlapping / Multiple Matches', () => {
    it('prompts user to clarify when query has multiple strong symptom matches', () => {
      // Both nausea (scenario-06) and stomach pain (scenario-09) are mentioned
      const match = matchIntent('I have nausea and stomach pain');
      expect(match.type).toBe('disambiguation');
      expect(match.candidateScenarios).toBeDefined();
      expect(match.candidateScenarios?.length).toBeGreaterThanOrEqual(2);
      expect(match.message).toContain('Which specific topic would you like to explore first?');
      expect(match.quickReplies.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('7. Context Retention Across Follow-Ups', () => {
    it('retains active scenario context when user clicks a quick reply', () => {
      // User is in Fever (scenario-01)
      const followUp = matchIntent('How long should I monitor it?', 'scenario-01');
      expect(followUp.type).toBe('scenario');
      expect(followUp.scenario?.id).toBe('scenario-01');
      expect(followUp.message).toContain('Monitoring duration for fever');
      expect(followUp.contextScenarioId).toBe('scenario-01');
    });

    it('retains active scenario context on short duration answers like "3 days"', () => {
      const followUp = matchIntent('3 days', 'scenario-01');
      expect(followUp.type).toBe('scenario');
      expect(followUp.scenario?.id).toBe('scenario-01');
      expect(followUp.message).toContain('Thank you for providing that detail regarding fever');
    });
  });

  describe('8. ConversationEngine & Guest Turn Budget Management', () => {
    let engine: ConversationEngine;

    beforeEach(() => {
      engine = new ConversationEngine();
    });

    it('tracks turns used up to MAX_GUEST_TURNS (6 turns)', () => {
      expect(engine.getSessionState().remainingTurns).toBe(6);

      for (let i = 1; i <= 6; i++) {
        const res = engine.processMessage('I have a headache');
        expect(res.type).toBe('scenario');
        expect(engine.getSessionState().turnsUsed).toBe(i);
      }

      expect(engine.getSessionState().isTurnLimitReached).toBe(true);
      expect(engine.getSessionState().remainingTurns).toBe(0);

      // 7th non-emergency turn should return turn limit message
      const lockedRes = engine.processMessage('I feel dizzy');
      expect(lockedRes.matchedTrigger).toBe('turn_budget_exhausted');
      expect(lockedRes.message).toContain('GUEST SESSION LIMIT REACHED');
      expect(lockedRes.quickReplies).toContain('Sign In / Sign Up');
    });

    it('ALLOWS EMERGENCY QUERIES EVEN WHEN TURN LIMIT IS REACHED (Emergency Bypass)', () => {
      // Exhaust turns
      for (let i = 1; i <= 6; i++) {
        engine.processMessage('I have a cough');
      }
      expect(engine.getSessionState().isTurnLimitReached).toBe(true);

      // Emergency query MUST still succeed
      const emergencyRes = engine.processMessage('I have severe chest pain and cannot breathe');
      expect(emergencyRes.type).toBe('emergency');
      expect(emergencyRes.isEmergency).toBe(true);
      expect(emergencyRes.message).toContain('EMERGENCY WARNING');
    });

    it('resets session cleanly when reset is invoked', () => {
      engine.processMessage('I have a fever');
      engine.processMessage('3 days');
      expect(engine.getSessionState().turnsUsed).toBe(2);

      engine.reset();
      expect(engine.getSessionState().turnsUsed).toBe(0);
      expect(engine.getSessionState().activeScenarioId).toBeUndefined();
      expect(engine.getSessionState().remainingTurns).toBe(6);
    });
  });

  describe('9. Multilingual & Honest Fallback Representation', () => {
    it('returns Telugu native response for Scenario 39', () => {
      const match = matchIntent('Explain my report in Telugu', undefined, 'te');
      expect(match.scenario?.id).toBe('scenario-39');
      expect(match.message).toContain('తప్పకుండా');
    });

    it('honestly represents untranslated scenarios with clear clinical notice', () => {
      const match = matchIntent('I have a headache', undefined, 'te');
      expect(match.scenario?.id).toBe('scenario-02');
      // Must contain notice indicating translation is pending clinical review
      expect(match.message).toContain('Translation pending clinical review');
      expect(match.message).toContain('తెలుగు అనువాదం క్లినికల్ సమీక్షలో ఉంది');
    });
  });
});
