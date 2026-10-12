import { describe, it, expect } from 'vitest';
import { MockExtractionProvider } from '../src/lib/ai/mock-provider';
import { GeminiProviderPlaceholder } from '../src/lib/ai/gemini-placeholder';
import { AIProviderError } from '../src/lib/ai/provider';

describe('MockExtractionProvider', () => {
  const provider = new MockExtractionProvider();

  it('reports operational health status in mock mode', async () => {
    const health = await provider.healthCheck();
    expect(health.isAvailable).toBe(true);
    expect(health.isMock).toBe(true);
    expect(health.providerName).toBe('SyntheticOfflineMockProvider');
  });

  it('extracts synthetic lab report fixture with input metadata', async () => {
    const result = await provider.extractDocument({
      fileName: 'patient_blood_work.pdf',
      fileSizeBytes: 102400,
      mimeType: 'application/pdf',
    });

    expect(result.id).toBeDefined();
    expect(result.fileName).toBe('patient_blood_work.pdf');
    expect(result.isSyntheticDemo).toBe(true);
    expect(result.fields.length).toBeGreaterThan(0);
  });

  it('generates grounded plain-language explanation in English', async () => {
    const explanation = await provider.explainEvidence({
      documentId: 'doc-123',
      fields: [
        { name: 'Hemoglobin', value: 11.2, unit: 'g/dL', interpretation: 'low' },
        { name: 'Fasting Blood Sugar', value: 118, unit: 'mg/dL', interpretation: 'high' },
      ],
      locale: 'en',
    });

    expect(explanation.summary).toContain('2 extracted lab tests');
    expect(explanation.bulletPoints.length).toBeGreaterThan(0);
    expect(explanation.suggestedDoctorQuestions.length).toBeGreaterThan(0);
    expect(explanation.clinicalDisclaimer).toContain('educational purposes');
    expect(explanation.isSyntheticDemo).toBe(true);
  });

  it('generates grounded plain-language explanation in Telugu', async () => {
    const explanation = await provider.explainEvidence({
      documentId: 'doc-123',
      fields: [
        { name: 'Hemoglobin', value: 11.2, unit: 'g/dL', interpretation: 'low' },
      ],
      locale: 'te',
    });

    expect(explanation.locale).toBe('te');
    expect(explanation.summary).toContain('నివేదిక');
    expect(explanation.bulletPoints.length).toBeGreaterThan(0);
  });
});

describe('GeminiProviderPlaceholder', () => {
  const gemini = new GeminiProviderPlaceholder();

  it('reports unconfigured status without throwing or revealing secrets', async () => {
    const health = await gemini.healthCheck();
    expect(health.providerName).toBe('GoogleGeminiProvider');
    expect(health.isMock).toBe(false);
    expect(health.isAvailable).toBe(false);
  });

  it('throws typed AIProviderError if extraction is attempted before wiring', async () => {
    try {
      await gemini.extractDocument({
        fileName: 'test.pdf',
        fileSizeBytes: 1024,
        mimeType: 'application/pdf',
      });
      expect.fail('Should have thrown AIProviderError');
    } catch (err) {
      expect(err).toBeInstanceOf(AIProviderError);
      const providerError = err as AIProviderError;
      expect(providerError.code).toBe('PROVIDER_UNAVAILABLE');
    }
  });
});
