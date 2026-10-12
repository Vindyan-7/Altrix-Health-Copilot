import type {
  AIProvider,
  DocumentInput,
  ExplainEvidenceRequest,
  ExplanationResult,
  ProviderHealth,
} from './provider';
import { AIProviderError } from './provider';
import type { ExtractedDocument } from '../../schemas/extraction';

/**
 * Gemini Provider Placeholder
 * Implements AIProvider interface ready for real Gemini SDK connection in Milestone 2.
 * Currently reports explicit unconfigured status rather than pretending to be connected.
 */
export class GeminiProviderPlaceholder implements AIProvider {
  public readonly name = 'GoogleGeminiProvider';
  public readonly isMock = false;

  private apiKey: string | undefined;
  private modelName: string | undefined;

  constructor() {
    // Only inspect server-side environment variables
    if (typeof process !== 'undefined' && process.env) {
      this.apiKey = process.env.GEMINI_API_KEY;
      this.modelName = process.env.GEMINI_MODEL;
    }
  }

  async extractDocument(_input: DocumentInput): Promise<ExtractedDocument> {
    if (!this.apiKey) {
      throw new AIProviderError(
        'Gemini API key is not configured on the server. Falling back to synthetic mock provider.',
        'PROVIDER_UNAVAILABLE',
        503
      );
    }
    throw new AIProviderError(
      'Live Gemini integration will be activated after model verification in Milestone 2. Please use the offline demo fixture.',
      'PROVIDER_UNAVAILABLE',
      503
    );
  }

  async explainEvidence(
    _request: ExplainEvidenceRequest
  ): Promise<ExplanationResult> {
    if (!this.apiKey) {
      throw new AIProviderError(
        'Gemini API key is not configured on the server. Falling back to deterministic templates.',
        'PROVIDER_UNAVAILABLE',
        503
      );
    }
    throw new AIProviderError(
      'Live Gemini explanation integration is not yet active. Using deterministic templates.',
      'PROVIDER_UNAVAILABLE',
      503
    );
  }

  async healthCheck(): Promise<ProviderHealth> {
    const hasKey = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    return {
      providerName: this.name,
      isAvailable: false,
      isMock: false,
      configuredModel: this.modelName || 'unconfigured',
      statusMessage: hasKey
        ? 'Gemini API key is present in environment, pending SDK client wiring in Milestone 2.'
        : 'Gemini API key is not configured. Running offline in synthetic mode.',
    };
  }
}
