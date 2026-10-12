import { matchIntent } from './matchIntent';
import type { ChatIntentMatch, ChatSessionState } from '../../types/healthChat';

export const MAX_GUEST_TURNS = 6;

export class ConversationEngine {
  private turnsUsed: number = 0;
  private activeScenarioId?: string;
  private locale: 'en' | 'te' = 'en';
  private isAuthenticated: boolean = false;

  constructor(initialState?: Partial<ChatSessionState>) {
    if (initialState) {
      this.turnsUsed = initialState.turnsUsed ?? 0;
      this.activeScenarioId = initialState.activeScenarioId;
      this.locale = initialState.locale ?? 'en';
      this.isAuthenticated = initialState.isAuthenticated ?? false;
    }
  }

  public setAuthenticated(status: boolean): void {
    this.isAuthenticated = status;
  }

  public setLocale(locale: 'en' | 'te'): void {
    this.locale = locale;
  }

  public getSessionState(): ChatSessionState & { remainingTurns: number; isTurnLimitReached: boolean } {
    const remaining = Math.max(0, MAX_GUEST_TURNS - this.turnsUsed);
    return {
      turnsUsed: this.turnsUsed,
      maxGuestTurns: MAX_GUEST_TURNS,
      activeScenarioId: this.activeScenarioId,
      locale: this.locale,
      isAuthenticated: this.isAuthenticated,
      remainingTurns: this.isAuthenticated ? 999 : remaining,
      isTurnLimitReached: !this.isAuthenticated && this.turnsUsed >= MAX_GUEST_TURNS,
    };
  }

  public reset(): void {
    this.turnsUsed = 0;
    this.activeScenarioId = undefined;
  }

  /**
   * Processes a user message or quick-reply selection.
   */
  public processMessage(message: string): ChatIntentMatch {
    const match = matchIntent(message, this.activeScenarioId, this.locale);

    // CRITICAL: Emergency escalation ALWAYS bypasses turn budget
    if (match.isEmergency) {
      // Do not block emergencies even if turns exhausted
      return match;
    }

    // Guest Turn Budget Enforcement
    if (!this.isAuthenticated && this.turnsUsed >= MAX_GUEST_TURNS) {
      return {
        type: 'fallback',
        confidence: 0,
        matchedTrigger: 'turn_budget_exhausted',
        isEmergency: false,
        safetyLevel: 'routine',
        message:
          'GUEST SESSION LIMIT REACHED: You have used your 6 guest preview turns.\n\n' +
          '• To continue conversations, save personal records, and unlock deep AI analysis, please Sign In or create a free account.\n' +
          '• Or click "Restart Session" below to begin a fresh guest preview.\n\n' +
          'Emergency assistance (Call 112 / 911) remains available at any time.',
        quickReplies: ['Sign In / Sign Up', 'Restart Session', 'Emergency Help (112)'],
        disclaimer: 'Guest mode limits ensure server stability and encourage private vault authentication.',
        citations: [],
      };
    }

    // Count turn for non-emergency guest queries
    if (!this.isAuthenticated) {
      this.turnsUsed++;
    }

    // Update active scenario context
    if (match.type === 'scenario' && match.scenario) {
      this.activeScenarioId = match.scenario.id;
    } else if (match.type === 'disambiguation') {
      // Keep previous active scenario or clear
    } else if (match.type === 'fallback') {
      this.activeScenarioId = undefined;
    }

    return match;
  }
}
