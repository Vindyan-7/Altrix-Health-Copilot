import { z } from 'zod';
import type {
  AIProvider,
  DocumentInput,
  ExplainEvidenceRequest,
  ExplanationResult,
  ProviderHealth,
} from './provider';
import { AIProviderError } from './provider';
import type { ExtractedDocument } from '../../schemas/extraction';
import { MockExtractionProvider } from './mock-provider';

/**
 * Zod schema for validated explanation output from Gemini
 */
const GeminiExplanationResponseSchema = z.object({
  summary: z.string().min(10).max(1000),
  bulletPoints: z.array(z.string().min(5).max(300)).min(1).max(8),
  suggestedDoctorQuestions: z.array(z.string().min(5).max(250)).min(1).max(5),
  clinicalDisclaimer: z.string().min(10),
});

/**
 * Server-only Google Gemini AI Provider
 * Communicates directly with Google Gemini REST API on the server.
 * Never executes in client bundles and never exposes API keys.
 */
export class GeminiProvider implements AIProvider {
  public readonly name = 'GoogleGeminiProvider';
  public readonly isMock = false;

  private apiKey: string | undefined;
  private modelName: string;
  private mockFallback: MockExtractionProvider;

  constructor() {
    this.mockFallback = new MockExtractionProvider();

    if (typeof process !== 'undefined' && process.env) {
      this.apiKey = process.env.GEMINI_API_KEY?.trim();
      this.modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';
    } else {
      this.modelName = 'gemini-3.8-flash';
    }
  }

  /**
   * Health check verifying configuration presence without exposing secrets
   */
  async healthCheck(): Promise<ProviderHealth> {
    const isConfigured = Boolean(
      this.apiKey &&
      this.apiKey.length > 0 &&
      !this.apiKey.includes('your-gemini-api-key')
    );

    return {
      providerName: this.name,
      isAvailable: isConfigured,
      isMock: false,
      configuredModel: this.modelName,
      statusMessage: isConfigured
        ? `Gemini server provider configured using model ${this.modelName}.`
        : 'Gemini API key is not configured on the server. Running in deterministic fallback mode.',
    };
  }

  /**
   * Document extraction: OCR is deferred in this phase
   */
  async extractDocument(input: DocumentInput): Promise<ExtractedDocument> {
    if (!this.apiKey) {
      return this.mockFallback.extractDocument(input);
    }
    // As per specification: OCR pipeline is developed in parallel branch; delegate to verified synthetic baseline
    return this.mockFallback.extractDocument(input);
  }

  /**
   * Grounded educational plain-language explanation of reviewed lab evidence
   */
  async explainEvidence(request: ExplainEvidenceRequest): Promise<ExplanationResult> {
    // Input validation: Enforce request bounds
    if (!request.fields || request.fields.length === 0) {
      throw new AIProviderError(
        'At least one laboratory field is required for explanation.',
        'VALIDATION_FAILED',
        400
      );
    }

    // Strict Synthetic-Only Restriction: Real patient data is never sent to external AI
    if (request.isSynthetic === false) {
      throw new AIProviderError(
        'REAL_PHI_DISALLOWED: Sending real patient data to external AI providers is prohibited. Only synthetic demo records are permitted.',
        'REAL_PHI_DISALLOWED',
        403
      );
    }

    // Fall back to deterministic templates if API key is unconfigured
    if (!this.apiKey || this.apiKey.includes('your-gemini-api-key')) {
      return this.mockFallback.explainEvidence(request);
    }

    const clampedFields = request.fields.slice(0, 15);
    const localePrompt = request.locale === 'te' ? 'Telugu (తెలుగు)' : 'English';

    const systemInstruction = `You are the Altrix Health Educational Copilot.
You explain laboratory report results in accessible, plain language for patients.
RULES:
1. Provide educational health information ONLY.
2. NEVER diagnose diseases, prescribe medications, or calculate drug dosages.
3. Ground your explanation EXCLUSIVELY in the provided lab values. Do not invent out-of-range findings.
4. Output language must be strictly ${localePrompt}.
5. You must return ONLY valid, raw JSON conforming to this schema:
{
  "summary": "Plain language overview of the findings (2-3 sentences)",
  "bulletPoints": ["Key finding 1", "Key finding 2"],
  "suggestedDoctorQuestions": ["Question to ask family doctor 1", "Question 2"],
  "clinicalDisclaimer": "Educational summary only. Not a medical diagnosis. Consult your doctor."
}`;

    const promptText = `Patient Concern: ${request.patientConcern || 'General review of my laboratory report'}\n\nReviewed Lab Evidence:\n` +
      clampedFields.map(f => `- ${f.name}: ${f.value} ${f.unit || ''} (Interpretation: ${f.interpretation || 'unspecified'}, Ref: ${f.referenceRangeText || 'not stated'})`).join('\n');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.modelName)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second strict timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: promptText }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
            responseMimeType: 'application/json',
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Do not leak secret in error logs
        const errorCode = response.status === 429 ? 'QUOTA_EXCEEDED' : 'PROVIDER_UNAVAILABLE';
        throw new AIProviderError(
          `Gemini API returned HTTP ${response.status}. Falling back to deterministic templates.`,
          errorCode,
          response.status
        );
      }

      const rawJson = await response.json();
      const candidateText = rawJson?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        throw new AIProviderError(
          'Gemini response contained no candidate text.',
          'VALIDATION_FAILED',
          502
        );
      }

      const parsedJson = JSON.parse(candidateText);
      const validated = GeminiExplanationResponseSchema.parse(parsedJson);

      return {
        summary: validated.summary,
        bulletPoints: validated.bulletPoints,
        suggestedDoctorQuestions: validated.suggestedDoctorQuestions,
        clinicalDisclaimer: validated.clinicalDisclaimer,
        isSyntheticDemo: true,
        evidenceCount: clampedFields.length,
        locale: request.locale,
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) {
        // Fall back gracefully to deterministic explanation
        return this.mockFallback.explainEvidence(request);
      }
      if (err.name === 'AbortError') {
        // Fall back gracefully upon timeout
        return this.mockFallback.explainEvidence(request);
      }
      // Any parsing or network failure falls back to deterministic template
      return this.mockFallback.explainEvidence(request);
    }
  }
}
