import { describe, it, expect } from 'vitest';
import {
  ExtractedDocumentSchema,
  ExtractedFieldSchema,
  evaluateRange,
  applyFieldCorrection,
  confirmField,
  type ExtractedField,
} from '../src/schemas/extraction';
import { SYNTHETIC_LAB_REPORT_FIXTURE } from '../src/fixtures/synthetic-lab-report';

describe('Extraction Schema Runtime Validation', () => {
  it('validates synthetic lab report fixture successfully', () => {
    const parsed = ExtractedDocumentSchema.safeParse(SYNTHETIC_LAB_REPORT_FIXTURE);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.fields.length).toBe(8);
      expect(parsed.data.isSyntheticDemo).toBe(true);
    }
  });

  it('rejects document with missing required fields', () => {
    const invalidDoc = {
      id: 'doc-123',
      // missing fileName, fileSize, mimeType, fields, etc.
    };
    const result = ExtractedDocumentSchema.safeParse(invalidDoc);
    expect(result.success).toBe(false);
  });

  it('rejects field with invalid confidence outside [0, 1]', () => {
    const invalidField = {
      id: 'f-test',
      name: 'Glucose',
      value: 100,
      confidence: 1.5, // invalid
      provenance: {
        page: 1,
        rawSnippet: 'Glucose 100',
      },
    };
    const result = ExtractedFieldSchema.safeParse(invalidField);
    expect(result.success).toBe(false);
  });
});

describe('Deterministic Reference Range Evaluation', () => {
  const range = { low: 70, high: 100, text: '70 - 100 mg/dL' };

  it('identifies value below range as low', () => {
    expect(evaluateRange(65, range)).toBe('low');
    expect(evaluateRange('60', range)).toBe('low');
  });

  it('identifies value above range as high', () => {
    expect(evaluateRange(118, range)).toBe('high');
    expect(evaluateRange('140.5', range)).toBe('high');
  });

  it('identifies value within range as normal', () => {
    expect(evaluateRange(85, range)).toBe('normal');
    expect(evaluateRange(70, range)).toBe('normal');
    expect(evaluateRange(100, range)).toBe('normal');
  });

  it('returns unspecified when range is missing or null', () => {
    expect(evaluateRange(120, undefined)).toBe('unspecified');
    expect(evaluateRange('text_val', range)).toBe('unspecified');
  });
});

describe('User Field Review & Correction Workflow', () => {
  const sampleField: ExtractedField = {
    id: 'f-platelets',
    name: 'Platelet Count',
    category: 'Hematology',
    value: 145000,
    unit: '/cumm',
    referenceRange: {
      low: 150000,
      high: 450000,
      text: '150,000 - 450,000 /cumm',
    },
    interpretation: 'low',
    confidence: 0.74,
    isUncertain: true,
    uncertaintyReason: 'Degraded OCR on slip',
    reviewStatus: 'unreviewed',
    provenance: {
      page: 1,
      rawSnippet: 'Platelets ~145,000 /cumm',
    },
  };

  it('applies user correction and resolves uncertainty', () => {
    const corrected = applyFieldCorrection(
      sampleField,
      175000,
      '/cumm',
      'Verified against clean printed slip'
    );

    expect(corrected.value).toBe(175000);
    expect(corrected.interpretation).toBe('normal'); // 175,000 is between 150,000 and 450,000
    expect(corrected.reviewStatus).toBe('corrected');
    expect(corrected.isUncertain).toBe(false);
    expect(corrected.uncertaintyReason).toBeNull();
    expect(corrected.correction).toBeDefined();
    expect(corrected.correction?.originalValue).toBe(145000);
    expect(corrected.correction?.correctedValue).toBe(175000);
    expect(corrected.correction?.reason).toBe('Verified against clean printed slip');
  });

  it('confirms field without editing value', () => {
    const confirmed = confirmField(sampleField);

    expect(confirmed.value).toBe(145000);
    expect(confirmed.reviewStatus).toBe('confirmed');
    expect(confirmed.isUncertain).toBe(false);
    expect(confirmed.uncertaintyReason).toBeNull();
  });
});
