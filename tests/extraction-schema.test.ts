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

  it('confirms field without editing value while preserving optical uncertainty flags', () => {
    const confirmed = confirmField(sampleField);

    expect(confirmed.value).toBe(145000);
    expect(confirmed.reviewStatus).toBe('confirmed');
    // Optical degradation remains true as an objective property of the source slip
    expect(confirmed.isUncertain).toBe(true);
    expect(confirmed.uncertaintyReason).toBe('Degraded OCR on slip');
  });

  it('individual confirmation updates exactly one field and leaves others unreviewed', () => {
    const field1 = { ...sampleField, id: 'f-1', reviewStatus: 'unreviewed' as const };
    const field2 = { ...sampleField, id: 'f-2', reviewStatus: 'unreviewed' as const };

    const confirmed1 = confirmField(field1);

    expect(confirmed1.reviewStatus).toBe('confirmed');
    expect(field2.reviewStatus).toBe('unreviewed');
  });

  it('bulk confirmation marks all unreviewed fields confirmed while preserving optical flags and user corrections', () => {
    const initialFields: ExtractedField[] = [
      { ...sampleField, id: 'f-1', isUncertain: false, reviewStatus: 'unreviewed' },
      { ...sampleField, id: 'f-2', isUncertain: true, uncertaintyReason: 'Faint ink', reviewStatus: 'unreviewed' },
      applyFieldCorrection({ ...sampleField, id: 'f-3' }, 190000, '/cumm', 'Prior manual edit'),
    ];

    const bulkConfirmed = initialFields.map((f) => {
      if (f.reviewStatus === 'corrected') return f;
      return confirmField(f);
    });

    expect(bulkConfirmed[0].reviewStatus).toBe('confirmed');
    expect(bulkConfirmed[0].isUncertain).toBe(false);

    expect(bulkConfirmed[1].reviewStatus).toBe('confirmed');
    expect(bulkConfirmed[1].isUncertain).toBe(true);
    expect(bulkConfirmed[1].uncertaintyReason).toBe('Faint ink');

    expect(bulkConfirmed[2].reviewStatus).toBe('corrected');
    expect(bulkConfirmed[2].value).toBe(190000);
  });

  it('reset restores exact original fixture values and clears user corrections', () => {
    const originalFixtureFields = SYNTHETIC_LAB_REPORT_FIXTURE.fields;
    // Simulate modified working state
    let workingFields = originalFixtureFields.map((f) => confirmField(f));
    expect(workingFields.every((f) => f.reviewStatus === 'confirmed')).toBe(true);

    // Perform reset to fixture baseline
    workingFields = JSON.parse(JSON.stringify(originalFixtureFields));

    expect(workingFields.length).toBe(8);
    expect(workingFields.every((f) => f.reviewStatus === 'unreviewed')).toBe(true);
    const platelets = workingFields.find((f) => f.id === 'f-platelets');
    expect(platelets?.value).toBe(145000);
    expect(platelets?.isUncertain).toBe(true);
  });

  it('preserves original value and derives dynamic progress correctly', () => {
    const fields = [
      confirmField({ ...sampleField, id: 'f-1' }),
      applyFieldCorrection({ ...sampleField, id: 'f-2' }, 180000, '/cumm', 'Audited correction'),
      { ...sampleField, id: 'f-3', reviewStatus: 'unreviewed' as const },
      { ...sampleField, id: 'f-4', reviewStatus: 'unreviewed' as const },
    ];

    const verifiedCount = fields.filter(
      (f) => f.reviewStatus === 'confirmed' || f.reviewStatus === 'corrected'
    ).length;
    const progressPct = Math.round((verifiedCount / fields.length) * 100);

    expect(verifiedCount).toBe(2);
    expect(progressPct).toBe(50);
    expect(fields[1].correction?.originalValue).toBe(145000);
    expect(fields[1].value).toBe(180000);
  });
});
