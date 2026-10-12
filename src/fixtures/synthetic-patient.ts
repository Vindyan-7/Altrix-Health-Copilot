/**
 * Synthetic Demo Patient Profile
 * Strictly non-PHI synthetic profile for demo testing.
 */
export interface SyntheticTimelineEvent {
  id: string;
  date: string;
  category: 'lab_report' | 'wellness' | 'prescription' | 'diagnostic';
  title: string;
  facility: string;
  summary: string;
  status: 'normal' | 'attention' | 'review_required';
  measurements?: Array<{
    name: string;
    value: string | number;
    unit?: string;
    flag?: 'normal' | 'low' | 'high';
  }>;
}

export interface SyntheticPatientProfile {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  mockAbhaId: string;
  isSyntheticDemo: true;
  primaryLanguage: 'en' | 'te';
  allergies: string[];
  timeline: SyntheticTimelineEvent[];
}

export const SYNTHETIC_PATIENT: SyntheticPatientProfile = {
  id: 'synth-pat-001',
  displayName: 'Priya Sharma',
  age: 34,
  gender: 'Female',
  bloodGroup: 'B Positive',
  mockAbhaId: '91-1234-5678-9012 (Demo Only)',
  isSyntheticDemo: true,
  primaryLanguage: 'en',
  allergies: ['Penicillin (documented in history)'],
  timeline: [
    {
      id: 'evt-01',
      date: '2026-10-10',
      category: 'lab_report',
      title: 'Comprehensive Metabolic & CBC Panel',
      facility: 'Metro Diagnostic Laboratories',
      summary:
        'Slightly lower hemoglobin (11.2 g/dL), elevated fasting glucose (118 mg/dL) and HbA1c (6.2%). Unreviewed platelet flag.',
      status: 'review_required',
      measurements: [
        { name: 'Hemoglobin', value: 11.2, unit: 'g/dL', flag: 'low' },
        { name: 'Fasting Glucose', value: 118, unit: 'mg/dL', flag: 'high' },
        { name: 'HbA1c', value: 6.2, unit: '%', flag: 'high' },
        { name: 'Serum Creatinine', value: 0.9, unit: 'mg/dL', flag: 'normal' },
      ],
    },
    {
      id: 'evt-02',
      date: '2026-09-18',
      category: 'wellness',
      title: 'Home Blood Pressure Check',
      facility: 'Home Digital Monitor (Self Logged)',
      summary: 'Resting morning blood pressure check: 118/78 mmHg.',
      status: 'normal',
      measurements: [
        { name: 'Systolic BP', value: 118, unit: 'mmHg', flag: 'normal' },
        { name: 'Diastolic BP', value: 78, unit: 'mmHg', flag: 'normal' },
        { name: 'Pulse', value: 72, unit: 'bpm', flag: 'normal' },
      ],
    },
    {
      id: 'evt-03',
      date: '2026-08-04',
      category: 'lab_report',
      title: 'Routine Health Checkup Panel',
      facility: 'Apollo Clinic (Demo Facility)',
      summary: 'Baseline lipid and liver function profiles were within expected reference ranges.',
      status: 'normal',
      measurements: [
        { name: 'Total Cholesterol', value: 182, unit: 'mg/dL', flag: 'normal' },
        { name: 'Triglycerides', value: 140, unit: 'mg/dL', flag: 'normal' },
        { name: 'SGPT / ALT', value: 24, unit: 'U/L', flag: 'normal' },
      ],
    },
    {
      id: 'evt-04',
      date: '2026-06-15',
      category: 'prescription',
      title: 'Clinical Consultation Note & Prescription',
      facility: 'City Health Center',
      summary:
        'Seasonal allergic rhinitis prescription restated as written. No antibiotic prescribed.',
      status: 'normal',
    },
  ],
};
