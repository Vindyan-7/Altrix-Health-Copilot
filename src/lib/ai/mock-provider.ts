import type {
  AIProvider,
  DocumentInput,
  ExplainEvidenceRequest,
  ExplanationResult,
  ProviderHealth,
} from './provider';
import {
  ExtractedDocumentSchema,
  type ExtractedDocument,
} from '../../schemas/extraction';
import { SYNTHETIC_LAB_REPORT_FIXTURE } from '../../fixtures/synthetic-lab-report';

export class MockExtractionProvider implements AIProvider {
  public readonly name = 'SyntheticOfflineMockProvider';
  public readonly isMock = true;

  async extractDocument(input: DocumentInput): Promise<ExtractedDocument> {
    // Simulate brief processing latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Deep clone the synthetic fixture
    const fixture: ExtractedDocument = JSON.parse(
      JSON.stringify(SYNTHETIC_LAB_REPORT_FIXTURE)
    );

    if (input.fileName) {
      fixture.fileName = input.fileName;
    }
    if (input.fileSizeBytes) {
      fixture.fileSize = input.fileSizeBytes;
    }
    if (input.mimeType) {
      fixture.mimeType = input.mimeType;
    }
    fixture.extractedAt = new Date().toISOString();

    // Validate runtime schema integrity before returning
    return ExtractedDocumentSchema.parse(fixture);
  }

  async explainEvidence(
    request: ExplainEvidenceRequest
  ): Promise<ExplanationResult> {
    const isTelugu = request.locale === 'te';

    const flaggedItems = request.fields.filter(
      (f) => f.interpretation === 'low' || f.interpretation === 'high'
    );

    let summaryText = '';
    let bulletPoints: string[] = [];
    let suggestedDoctorQuestions: string[] = [];

    if (isTelugu) {
      summaryText = `ఈ నివేదికలో మొత్తం ${request.fields.length} పరీక్షలు గుర్తించబడ్డాయి. వీటిలో ${flaggedItems.length} విలువలు ల్యాబ్ ప్రామాణిక పరిమితుల కంటే భిన్నంగా ఉన్నాయి. ఇది కేవలం సమాచార ప్రయోజనాల కోసం మాత్రమే; వైద్యుడిని సంప్రదించండి.`;

      bulletPoints = [
        'హీమోగ్లోబిన్: సాధారణ పరిధి కంటే తక్కువగా ఉంది (శరీరంలో ఆక్సిజన్ రవాణాకు సహాయపడే ప్రోటీన్).',
        'ఫాస్టింగ్ బ్లడ్ షుగర్ మరియు HbA1c: ల్యాబ్ రిఫరెన్స్ పరిధి కంటే ఎక్కువగా నమోదయ్యాయి.',
        'ప్లేట్‌లెట్ కౌంట్ మరియు TSH: సంపూర్ణ సమీక్ష కోసం స్పష్టత అవసరం.',
      ];

      suggestedDoctorQuestions = [
        'నా రక్తంలో షుగర్ మరియు HbA1c స్థాయిలకు సంబంధించి ఆహార మార్పులు ఏమి చేయాలి?',
        'తక్కువ హీమోగ్లోబిన్ కోసం ఐరన్ లేదా అదనపు పరీక్షలు అవసరమా?',
        'ఈ పరీక్షలను ఎన్ని రోజుల తర్వాత మళ్లీ చేయించుకోవాలి?',
      ];
    } else {
      summaryText = `This report contains ${request.fields.length} extracted lab tests. ${flaggedItems.length} findings differ from the laboratory's standard reference range. All findings are derived directly from the document without external inference.`;

      bulletPoints = [
        'Hemoglobin (11.2 g/dL): Below the reference range (12.0 - 15.5 g/dL). Hemoglobin carries oxygen throughout the body.',
        'Blood Glucose (FBS 118 mg/dL, HbA1c 6.2%): Fasting sugar and 3-month glycated hemoglobin are above standard reference limits.',
        'Uncertain readings: Platelet count and TSH had faint/smudged printing on the slip and require manual review.',
      ];

      suggestedDoctorQuestions = [
        'What lifestyle or dietary adjustments do you recommend for my blood sugar and HbA1c levels?',
        'Does the slightly lower hemoglobin indicate dietary iron deficiency, and should we re-test?',
        'When should follow-up blood work be scheduled?',
      ];
    }

    return {
      summary: summaryText,
      bulletPoints,
      suggestedDoctorQuestions,
      clinicalDisclaimer:
        'IMPORTANT: This plain-language explanation is generated for educational purposes based exclusively on the reviewed lab report. It does not constitute medical diagnosis, prescribing, or treatment advice. Consult a licensed healthcare provider.',
      isSyntheticDemo: true,
      evidenceCount: request.fields.length,
      locale: request.locale,
    };
  }

  async generateChat(request: import('./provider').GeneralChatRequest): Promise<import('./provider').GeneralChatResponse> {
    const isTelugu = request.locale === 'te';

    let messageText = '';
    let suggestedQuestions: string[] = [];

    if (isTelugu) {
      messageText = `సాధారణ ఆరోగ్య AI చాట్ ప్రస్తుతం అందుబాటులో లేదు. దయచేసి క్రింద ఉన్న 40 నిర్దిష్ట అంశాల గైడెడ్ హెల్త్ కోపైలట్‌ను ఉపయోగించండి, ఇది ధృవీకరించబడిన ఆధారాలతో ఖచ్చితమైన విద్యా సమాచారాన్ని అందిస్తుంది. అత్యవసర పరిస్థితుల్లో వెంటనే 112 లేదా 108 కు కాల్ చేయండి.`;
      suggestedQuestions = [
        'జ్వరం వచ్చినప్పుడు తీసుకోవలసిన జాగ్రత్తలు ఏమిటి?',
        'ల్యాబ్ నివేదిక వివరాలు ఎలా అర్థం చేసుకోవాలి?',
        'తీవ్ర తలనొప్పికి తీసుకోవలసిన జాగ్రత్తలు ఏమిటి?',
      ];
    } else {
      messageText = `General health AI chat is temporarily unavailable because the AI service is unconfigured or temporarily unreachable. ` +
        `Please use our curated Guided Health Copilot below, which provides source-backed guidance across 40 clinical scenarios without requiring AI connectivity. ` +
        `For urgent medical symptoms, seek immediate evaluation or call emergency services (112 / 108 / 911).`;
      suggestedQuestions = [
        'I have a fever',
        'I have a headache',
        'Can you explain my blood test report',
        'Safe medicine principles',
      ];
    }

    return {
      message: messageText,
      isMockFallback: true,
      isUnavailable: true,
      provider: 'ServiceUnavailable',
      disclaimer: 'Educational guidance only. Not a medical diagnosis or prescription. General AI chat is unavailable; guided catalogue remains fully operational.',
      suggestedQuestions,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      providerName: this.name,
      isAvailable: true,
      isMock: true,
      statusMessage:
        'Mock offline extraction provider is operational using verified synthetic fixtures.',
      latencyMs: 15,
    };
  }
}
