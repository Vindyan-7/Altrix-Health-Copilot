import type { ExtractedDocument } from '../schemas/extraction';

/**
 * Synthetic Demo Lab Report Fixture
 * Clearly labelled synthetic test data for offline demonstration and testing.
 * No real Protected Health Information (PHI) is included.
 */
export const SYNTHETIC_LAB_REPORT_FIXTURE: ExtractedDocument = {
  id: 'doc-synth-cbc-20261012',
  documentType: 'lab_report',
  fileName: 'synth_demo_blood_report_2026.pdf',
  fileSize: 245760, // 240 KB
  mimeType: 'application/pdf',
  extractedAt: '2026-10-12T10:00:00.000Z',
  provider: 'mock-offline-extractor',
  facilityName: 'Metro Diagnostic Laboratories (Demo Facility)',
  patientDisplayName: 'Priya Sharma (Synthetic Demo Profile)',
  documentDate: '2026-10-10',
  isSyntheticDemo: true,
  confidenceAverage: 0.92,
  unresolvedFieldCount: 2,
  clinicalDisclaimer:
    'DEMO ONLY: This is a synthetic health record for prototype testing. Not for medical diagnosis, treatment, or clinical decision making.',
  fields: [
    {
      id: 'f-hemoglobin',
      name: 'Hemoglobin',
      category: 'Hematology',
      value: 11.2,
      unit: 'g/dL',
      referenceRange: {
        low: 12.0,
        high: 15.5,
        text: '12.0 - 15.5 g/dL',
      },
      interpretation: 'low',
      confidence: 0.98,
      isUncertain: false,
      reviewStatus: 'unreviewed',
      provenance: {
        page: 1,
        boundingBox: { top: 18, left: 12, width: 75, height: 4 },
        rawSnippet: 'Hemoglobin ................... 11.2 g/dL (Ref: 12.0 - 15.5)',
      },
    },
    {
      id: 'f-rbc',
      name: 'RBC Count',
      category: 'Hematology',
      value: 4.1,
      unit: 'million/mcL',
      referenceRange: {
        low: 3.8,
        high: 5.2,
        text: '3.8 - 5.2 million/mcL',
      },
      interpretation: 'normal',
      confidence: 0.96,
      isUncertain: false,
      reviewStatus: 'unreviewed',
      provenance: {
        page: 1,
        boundingBox: { top: 23, left: 12, width: 75, height: 4 },
        rawSnippet: 'RBC Count .................... 4.1 million/mcL (Ref: 3.8 - 5.2)',
      },
    },
    {
      id: 'f-wbc',
      name: 'Total Leukocyte Count (WBC)',
      category: 'Hematology',
      value: 7800,
      unit: '/cumm',
      referenceRange: {
        low: 4000,
        high: 11000,
        text: '4000 - 11000 /cumm',
      },
      interpretation: 'normal',
      confidence: 0.99,
      isUncertain: false,
      reviewStatus: 'unreviewed',
      provenance: {
        page: 1,
        boundingBox: { top: 28, left: 12, width: 75, height: 4 },
        rawSnippet: 'Total WBC .................... 7,800 /cumm (Ref: 4,000 - 11,000)',
      },
    },
    {
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
      uncertaintyReason: 'Number slightly degraded near decimal separator on source slip',
      reviewStatus: 'unreviewed',
      provenance: {
        page: 1,
        boundingBox: { top: 33, left: 12, width: 75, height: 4 },
        rawSnippet: 'Platelets .................... ~145,000 /cumm [faint print]',
      },
    },
    {
      id: 'f-fbs',
      name: 'Fasting Blood Sugar (Glucose)',
      category: 'Biochemistry',
      value: 118,
      unit: 'mg/dL',
      referenceRange: {
        low: 70,
        high: 100,
        text: '70 - 100 mg/dL (Normal fasting)',
      },
      interpretation: 'high',
      confidence: 0.97,
      isUncertain: false,
      reviewStatus: 'unreviewed',
      provenance: {
        page: 1,
        boundingBox: { top: 42, left: 12, width: 75, height: 4 },
        rawSnippet: 'Glucose, Fasting ............. 118 mg/dL (Ref: 70 - 100 mg/dL)',
      },
    },
    {
      id: 'f-hba1c',
      name: 'HbA1c (Glycated Hemoglobin)',
      category: 'Biochemistry',
      value: 6.2,
      unit: '%',
      referenceRange: {
        low: null,
        high: 5.7,
        text: '< 5.7% (Non-diabetic)',
      },
      interpretation: 'high',
      confidence: 0.95,
      isUncertain: false,
      reviewStatus: 'unreviewed',
      provenance: {
        page: 1,
        boundingBox: { top: 47, left: 12, width: 75, height: 4 },
        rawSnippet: 'HbA1c ........................ 6.2 % (Ref: < 5.7%)',
      },
    },
    {
      id: 'f-creatinine',
      name: 'Serum Creatinine',
      category: 'Renal Panel',
      value: 0.9,
      unit: 'mg/dL',
      referenceRange: {
        low: 0.6,
        high: 1.2,
        text: '0.6 - 1.2 mg/dL',
      },
      interpretation: 'normal',
      confidence: 0.98,
      isUncertain: false,
      reviewStatus: 'unreviewed',
      provenance: {
        page: 1,
        boundingBox: { top: 56, left: 12, width: 75, height: 4 },
        rawSnippet: 'Serum Creatinine ............. 0.90 mg/dL (Ref: 0.6 - 1.2)',
      },
    },
    {
      id: 'f-tsh',
      name: 'TSH (Thyroid Stimulating Hormone)',
      category: 'Endocrinology',
      value: 5.4,
      unit: 'uIU/mL',
      referenceRange: {
        low: 0.4,
        high: 4.5,
        text: '0.40 - 4.50 uIU/mL',
      },
      interpretation: 'high',
      confidence: 0.68,
      isUncertain: true,
      uncertaintyReason: 'Unit prefix label partially obscured by stamp',
      reviewStatus: 'unreviewed',
      provenance: {
        page: 1,
        boundingBox: { top: 64, left: 12, width: 75, height: 4 },
        rawSnippet: 'TSH (Ultrasensitive) ......... 5.4 [uIU/mL?] (Ref: 0.4 - 4.5)',
      },
    },
  ],
};

/**
 * Derived Shared Statistics for Cross-Page Consistency
 * Accurately derives metrics from the shared fixture.
 */
export const SYNTHETIC_REPORT_STATS = {
  totalFieldsCount: SYNTHETIC_LAB_REPORT_FIXTURE.fields.length, // 8
  outOfRangeFields: SYNTHETIC_LAB_REPORT_FIXTURE.fields.filter(
    (f) => f.interpretation === 'low' || f.interpretation === 'high'
  ),
  outOfRangeCount: SYNTHETIC_LAB_REPORT_FIXTURE.fields.filter(
    (f) => f.interpretation === 'low' || f.interpretation === 'high'
  ).length, // 5
  uncertainFields: SYNTHETIC_LAB_REPORT_FIXTURE.fields.filter((f) => f.isUncertain),
  uncertainFieldsCount: SYNTHETIC_LAB_REPORT_FIXTURE.fields.filter((f) => f.isUncertain).length, // 2
  normalFieldsCount: SYNTHETIC_LAB_REPORT_FIXTURE.fields.filter(
    (f) => f.interpretation === 'normal'
  ).length, // 3
};
