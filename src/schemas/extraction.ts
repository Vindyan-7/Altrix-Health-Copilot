import { z } from 'zod';

/**
 * Supported document classifications
 */
export const DocumentTypeSchema = z.enum([
  'lab_report',
  'prescription',
  'diagnostic_report',
  'discharge_summary',
  'wellness_log',
  'other',
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

/**
 * Review status for an extracted field
 */
export const ReviewStatusSchema = z.enum([
  'unreviewed',
  'confirmed',
  'corrected',
]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

/**
 * Diagnostic interpretation against source-provided reference ranges
 */
export const InterpretationSchema = z.enum([
  'normal',
  'low',
  'high',
  'critical',
  'unspecified',
]);
export type Interpretation = z.infer<typeof InterpretationSchema>;

/**
 * Source provenance indicating where in the document the fact was extracted from
 */
export const SourceProvenanceSchema = z.object({
  page: z.number().int().positive().default(1),
  boundingBox: z
    .object({
      top: z.number().min(0).max(100).optional(),
      left: z.number().min(0).max(100).optional(),
      width: z.number().min(0).max(100).optional(),
      height: z.number().min(0).max(100).optional(),
    })
    .optional(),
  rawSnippet: z.string().min(1),
});
export type SourceProvenance = z.infer<typeof SourceProvenanceSchema>;

/**
 * Reference range as stated in the source document
 */
export const ReferenceRangeSchema = z.object({
  low: z.number().nullable().optional(),
  high: z.number().nullable().optional(),
  text: z.string().nullable().optional(),
});
export type ReferenceRange = z.infer<typeof ReferenceRangeSchema>;

/**
 * User correction audit record
 */
export const FieldCorrectionSchema = z.object({
  originalValue: z.union([z.string(), z.number()]),
  correctedValue: z.union([z.string(), z.number()]),
  correctedAt: z.string().datetime(),
  reason: z.string().optional(),
});
export type FieldCorrection = z.infer<typeof FieldCorrectionSchema>;

/**
 * An individual extracted field (e.g. lab observation or document metadata)
 */
export const ExtractedFieldSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().default('general'),
  value: z.union([z.string(), z.number()]),
  unit: z.string().nullable().optional(),
  referenceRange: ReferenceRangeSchema.optional(),
  interpretation: InterpretationSchema.default('unspecified'),
  confidence: z.number().min(0).max(1),
  isUncertain: z.boolean().default(false),
  uncertaintyReason: z.string().nullable().optional(),
  reviewStatus: ReviewStatusSchema.default('unreviewed'),
  provenance: SourceProvenanceSchema,
  correction: FieldCorrectionSchema.optional(),
});
export type ExtractedField = z.infer<typeof ExtractedFieldSchema>;

/**
 * Document extraction payload schema
 */
export const ExtractedDocumentSchema = z.object({
  id: z.string().min(1),
  documentType: DocumentTypeSchema,
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  extractedAt: z.string().datetime(),
  provider: z.string().min(1),
  facilityName: z.string().nullable().optional(),
  patientDisplayName: z.string().default('Demo Synthetic Patient'),
  documentDate: z.string().nullable().optional(),
  isSyntheticDemo: z.literal(true),
  confidenceAverage: z.number().min(0).max(1),
  fields: z.array(ExtractedFieldSchema),
  unresolvedFieldCount: z.number().int().nonnegative(),
  clinicalDisclaimer: z.string(),
});
export type ExtractedDocument = z.infer<typeof ExtractedDocumentSchema>;

/**
 * Schema for updating an extracted field via user review
 */
export const UpdateFieldRequestSchema = z.object({
  fieldId: z.string().min(1),
  newValue: z.union([z.string(), z.number()]),
  newUnit: z.string().nullable().optional(),
  reason: z.string().optional(),
});
export type UpdateFieldRequest = z.infer<typeof UpdateFieldRequestSchema>;

/**
 * Helper to evaluate interpretation against a report's own reference ranges
 */
export function evaluateRange(
  val: number | string,
  range?: ReferenceRange
): Interpretation {
  if (!range) return 'unspecified';
  const numericVal = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(numericVal)) return 'unspecified';

  if (range.low !== null && range.low !== undefined && numericVal < range.low) {
    return 'low';
  }
  if (range.high !== null && range.high !== undefined && numericVal > range.high) {
    return 'high';
  }
  if (
    range.low !== null &&
    range.low !== undefined &&
    range.high !== null &&
    range.high !== undefined &&
    numericVal >= range.low &&
    numericVal <= range.high
  ) {
    return 'normal';
  }
  return 'unspecified';
}

/**
 * Pure function to apply user correction to an extracted field
 */
export function applyFieldCorrection(
  field: ExtractedField,
  newValue: string | number,
  newUnit?: string | null,
  reason?: string
): ExtractedField {
  const updatedInterpretation = evaluateRange(newValue, field.referenceRange);

  return {
    ...field,
    value: newValue,
    unit: newUnit !== undefined ? newUnit : field.unit,
    interpretation: updatedInterpretation,
    reviewStatus: 'corrected',
    isUncertain: false,
    uncertaintyReason: null,
    correction: {
      originalValue: field.value,
      correctedValue: newValue,
      correctedAt: new Date().toISOString(),
      reason: reason || 'User manual correction',
    },
  };
}

/**
 * Pure function to confirm an extracted field without edits
 */
export function confirmField(field: ExtractedField): ExtractedField {
  return {
    ...field,
    reviewStatus: 'confirmed',
    isUncertain: false,
    uncertaintyReason: null,
  };
}
