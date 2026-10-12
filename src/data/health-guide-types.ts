/**
 * Health Guide Catalogue Schema and Types
 * Defines the structured contract for curated, source-backed patient health guides.
 */

export type GuideCategory = 
  | 'symptom'
  | 'medicine'
  | 'emergency'
  | 'first_aid'
  | 'general';

export type SupportedLocale = 'en' | 'te';

export interface HealthGuide {
  id: string;
  category: GuideCategory;
  locale: SupportedLocale;
  title: string;
  summary: string;
  details?: string[];
  warningSigns: string[];
  nextSteps: string[];
  sourceName: string;
  sourceUrl: string;
  reviewedDate: string;
  clinicalDisclaimer: string;
  quickQuestions?: string[];
}

export interface IntentMatchResult {
  matched: boolean;
  intent: string;
  guide?: HealthGuide;
  isEmergency: boolean;
  confidence: 'high' | 'medium' | 'none';
  suggestedTopics?: Array<{ id: string; label: string }>;
}
