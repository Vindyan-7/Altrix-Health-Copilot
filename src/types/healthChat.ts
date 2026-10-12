/**
 * Altrix Health Copilot — Scenario Engine Type Definitions
 * Phase 4A: Structured 40-Scenario Engine & Reusable Contracts
 */

export type SafetyLevel = 'routine' | 'caution' | 'urgent';

export interface SourceCitation {
  title: string;
  url: string;
  organization: string;
}

export interface ChatScenario {
  /** Canonical scenario identifier (e.g., 'scenario-01') */
  id: string;
  /** 1-based index (1 to 40) */
  scenarioNumber: number;
  /** Scenario title in English */
  title: string;
  /** Representative user query */
  exampleInput: string;
  /** Trigger phrases matched via normalized word boundaries */
  triggers: string[];
  /** Secondary keyword tokens */
  keywords: string[];
  /** Canonical predefined educational response text */
  response: string;
  /** Suggested prompt chips / quick replies */
  quickReplies: string[];
  /** Clinical safety classification */
  safetyLevel: SafetyLevel;
  /** Non-clinical educational disclaimer */
  disclaimer?: string;
  /** Clinical flow guidelines and boundary notes */
  flowNotes?: string;
  /** Source citations; flagged if unspecified in raw source markdown */
  sourceCitations: SourceCitation[];
  /** Citation audit flag */
  citationStatus: 'verified' | 'unspecified_in_source';
  /** Multilingual completeness flag */
  hasTeluguTranslation: boolean;
  /** Curated Telugu response if available */
  teluguResponse?: string;
}

export type MatchResultType =
  | 'emergency'
  | 'dosage_interception'
  | 'scenario'
  | 'disambiguation'
  | 'fallback';

export interface ChatIntentMatch {
  type: MatchResultType;
  scenario?: ChatScenario;
  candidateScenarios?: ChatScenario[];
  confidence: number;
  matchedTrigger?: string;
  message: string;
  quickReplies: string[];
  safetyLevel: SafetyLevel;
  isEmergency: boolean;
  disclaimer: string;
  citations: SourceCitation[];
  contextScenarioId?: string;
}

export interface ChatSessionState {
  turnsUsed: number;
  maxGuestTurns: number;
  activeScenarioId?: string;
  locale: 'en' | 'te';
  isAuthenticated?: boolean;
}
