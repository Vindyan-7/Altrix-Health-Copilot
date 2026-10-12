import type { APIRoute } from 'astro';
import { z } from 'zod';
import { GeminiProvider } from '../../../lib/ai/gemini-provider';
import { routeGuestQuery } from '../../../lib/ai/guest-router';
import type { ExplainEvidenceRequest } from '../../../lib/ai/provider';

export const prerender = false;

const ExplainRequestBodySchema = z.object({
  documentId: z.string().default('synthetic-report-001'),
  fields: z.array(
    z.object({
      name: z.string().min(1).max(100),
      value: z.union([z.string(), z.number()]),
      unit: z.string().nullable().optional(),
      interpretation: z.string().optional(),
      referenceRangeText: z.string().nullable().optional(),
    })
  ).min(1).max(20),
  locale: z.enum(['en', 'te']).default('en'),
  patientConcern: z.string().max(300).optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON request body',
          code: 'BAD_REQUEST',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = ExplainRequestBodySchema.safeParse(rawBody);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: parseResult.error.format(),
          code: 'INVALID_PAYLOAD',
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { documentId, fields, locale, patientConcern } = parseResult.data;

    // Safety Gate: If user concern has emergency red flags or dosage requests, intercept deterministically!
    if (patientConcern) {
      const safetyCheck = routeGuestQuery(patientConcern, locale);
      if (safetyCheck.isEmergency) {
        return new Response(
          JSON.stringify({
            isEmergency: true,
            summary: locale === 'te'
              ? 'తక్షణ అత్యవసర హెచ్చరిక: మీ లక్షణాలు అత్యవసర వైద్య పరిస్థితిని సూచిస్తున్నాయి. దయచేసి వెంటనే 112 / 108 కి కాల్ చేయండి.'
              : 'CRITICAL EMERGENCY WARNING: Your query indicates a medical emergency. Please call 112 / 108 (India) or 911 (US) immediately.',
            bulletPoints: [
              'Do not wait to see if symptoms improve.',
              'Proceed immediately to the nearest hospital emergency department.',
            ],
            suggestedDoctorQuestions: ['What emergency treatment is required right now?'],
            clinicalDisclaimer: 'Emergency response protocol activated. Do not delay professional emergency care.',
            isSyntheticDemo: true,
            evidenceCount: fields.length,
            locale,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (safetyCheck.intent === 'blocked_dosage_request') {
        return new Response(
          JSON.stringify({
            isBlockedDosage: true,
            summary: locale === 'te'
              ? 'క్లినికల్ భద్రతా నియమం: మేము లక్షణాల ఆధారంగా మోతాదు నిర్ణయించలేము లేదా భద్రతా హామీలు ఇవ్వలేము.'
              : 'Clinical Safety Policy: We cannot recommend individual dosages or provide universal safety guarantees.',
            bulletPoints: [
              'Check official packaging or manufacturer package insert.',
              'Consult a licensed physician or pharmacist for personal dosing.',
            ],
            suggestedDoctorQuestions: ['What is the correct dosage prescribed for my condition?'],
            clinicalDisclaimer: 'Educational overview only. No individualized dosing or medication changes permitted.',
            isSyntheticDemo: true,
            evidenceCount: fields.length,
            locale,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const explainRequest: ExplainEvidenceRequest = {
      documentId,
      fields: fields.map((f) => ({
        name: f.name,
        value: f.value,
        unit: f.unit ?? undefined,
        interpretation: f.interpretation,
        referenceRangeText: f.referenceRangeText ?? undefined,
      })),
      locale,
      patientConcern,
    };

    const provider = new GeminiProvider();
    const explanation = await provider.explainEvidence(explainRequest);

    return new Response(
      JSON.stringify(explanation),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'An internal error occurred during explanation generation',
        code: 'INTERNAL_SERVER_ERROR',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
