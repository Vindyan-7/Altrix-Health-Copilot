import type { ExtractedDocument } from '../../schemas/extraction';

/**
 * File input payload for document extraction
 */
export interface DocumentInput {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  buffer?: Uint8Array | ArrayBuffer;
  isSyntheticDemoFixture?: boolean;
}

/**
 * Health check report for an AI extraction provider
 */
export interface ProviderHealth {
  providerName: string;
  isAvailable: boolean;
  isMock: boolean;
  statusMessage: string;
  configuredModel?: string;
  latencyMs?: number;
}

/**
 * Plain-language explanation request grounded in reviewed evidence
 */
export interface ExplainEvidenceRequest {
  documentId: string;
  isSynthetic?: boolean;
  fields: Array<{
    name: string;
    value: string | number;
    unit?: string | null;
    interpretation?: string;
    referenceRangeText?: string | null;
  }>;
  locale: 'en' | 'te';
  patientConcern?: string;
}

/**
 * Grounded plain-language explanation result
 */
export interface ExplanationResult {
  summary: string;
  bulletPoints: string[];
  suggestedDoctorQuestions: string[];
  clinicalDisclaimer: string;
  isSyntheticDemo: true;
  evidenceCount: number;
  locale: 'en' | 'te';
}

/**
 * Typed error for AI provider operations
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public code:
      | 'PROVIDER_UNAVAILABLE'
      | 'INVALID_DOCUMENT'
      | 'UNSUPPORTED_TYPE'
      | 'QUOTA_EXCEEDED'
      | 'TIMEOUT'
      | 'VALIDATION_FAILED'
      | 'REAL_PHI_DISALLOWED',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

/**
 * General educational chat request message
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeneralChatRequest {
  messages: ChatMessage[];
  locale?: 'en' | 'te';
}

export interface GeneralChatResponse {
  message: string;
  isMockFallback: boolean;
  isUnavailable?: boolean;
  provider: string;
  disclaimer: string;
  suggestedQuestions?: string[];
}

/**
 * Server-side AI Provider contract
 */
export interface AIProvider {
  readonly name: string;
  readonly isMock: boolean;
  extractDocument(input: DocumentInput): Promise<ExtractedDocument>;
  explainEvidence(request: ExplainEvidenceRequest): Promise<ExplanationResult>;
  generateChat(request: GeneralChatRequest): Promise<GeneralChatResponse>;
  healthCheck(): Promise<ProviderHealth>;
}

