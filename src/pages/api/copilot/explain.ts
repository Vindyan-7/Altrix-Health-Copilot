import type { APIRoute } from 'astro';
import { z } from 'zod';
import { GeminiProvider } from '../../../lib/ai/gemini-provider';
import { routeGuestQuery } from '../../../lib/ai/guest-router';
import type { ExplainEvidenceRequest } from '../../../lib/ai/provider';

export const prerender = false;

// 1. Abuse Control & Rate Limiting: Max 10 requests per minute per IP
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();
const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000;
const MAX_PAYLOAD_BYTES = 32 * 1024; // 32 KB

function pruneExpiredBuckets(now: number) {
  if (rateLimitMap.size > 500) {
    for (const [key, bucket] of rateLimitMap.entries()) {
      if (now > bucket.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }
}

function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number; retryAfterSeconds: number; resetAt: number } {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const bucket = rateLimitMap.get(clientIp);

  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + WINDOW_MS;
    rateLimitMap.set(clientIp, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1, retryAfterSeconds: 0, resetAt };
  }

  if (bucket.count >= MAX_REQUESTS_PER_MINUTE) {
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - bucket.count, retryAfterSeconds: 0, resetAt: bucket.resetAt };
}

// 2. Strict Input Validation Schema
const ExplainRequestBodySchema = z.object({
  documentId: z.string().max(100).default('synthetic-report-001'),
  fields: z.array(
    z.object({
      name: z.string().min(1).max(100),
      value: z.union([z.string().max(50), z.number()]),
      unit: z.string().max(30).nullable().optional(),
      interpretation: z.string().max(30).optional(),
      referenceRangeText: z.string().max(100).nullable().optional(),
    })
  ).min(1).max(20),
  locale: z.enum(['en', 'te']).default('en'),
  patientConcern: z.string().max(300).optional(),
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // A. Request Size Validation (Prevent payload bombing)
  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader && parseInt(contentLengthHeader, 10) > MAX_PAYLOAD_BYTES) {
    return new Response(
      JSON.stringify({
        error: 'Payload Too Large. Maximum allowed request size is 32 KB.',
        code: 'PAYLOAD_TOO_LARGE',
      }),
      { status: 413, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // B. Rate Limiting Check (Prevent automated scraping and quota exhaustion)
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    clientAddress ||
    'unknown-client';
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests. Rate limit of 10 requests per minute exceeded.',
        code: 'RATE_LIMIT_EXCEEDED',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_MINUTE),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    );
  }

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

    // C. Safety Gate Precedence: Deterministic Emergency and Dosage Guardrails
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
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_MINUTE),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
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
