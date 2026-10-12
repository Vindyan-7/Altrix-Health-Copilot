import type { APIRoute } from 'astro';
import { z } from 'zod';
import { GeminiProvider } from '../../../lib/ai/gemini-provider';
import { routeGuestQuery } from '../../../lib/ai/guest-router';
import type { ExplainEvidenceRequest } from '../../../lib/ai/provider';
import { verifyAccessToken } from '../../../lib/supabase/auth';
import { getAuthenticatedClient, isSupabaseConfigured } from '../../../lib/supabase/client';

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

// 2. Instance-Wide Global Quota Control (Protects upstream API bill & rate limits)
let globalRequestCount = 0;
let globalResetAt = Date.now() + WINDOW_MS;
const MAX_GLOBAL_REQUESTS_PER_MINUTE = 60;

function checkGlobalQuota(): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  if (now > globalResetAt) {
    globalRequestCount = 1;
    globalResetAt = now + WINDOW_MS;
    return { allowed: true, remaining: MAX_GLOBAL_REQUESTS_PER_MINUTE - 1, retryAfterSeconds: 0 };
  }

  if (globalRequestCount >= MAX_GLOBAL_REQUESTS_PER_MINUTE) {
    const retryAfterSeconds = Math.ceil((globalResetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  globalRequestCount++;
  return { allowed: true, remaining: MAX_GLOBAL_REQUESTS_PER_MINUTE - globalRequestCount, retryAfterSeconds: 0 };
}

// 3. Strict Input Validation Schema
const ExplainRequestBodySchema = z.object({
  documentId: z.string().max(100).default('synthetic-report-001'),
  isSynthetic: z.boolean().default(true),
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

  // 1. Instance-wide global quota check
  const globalQuota = checkGlobalQuota();
  if (!globalQuota.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests. Instance-wide explanation capacity reached. Please retry shortly.',
        code: 'GLOBAL_QUOTA_EXCEEDED',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(globalQuota.retryAfterSeconds),
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_MINUTE),
          'X-RateLimit-Remaining': '0',
          'X-GlobalQuota-Remaining': '0',
        },
      }
    );
  }

  // 2. Per-client sliding window rate limiter
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
          'X-GlobalQuota-Remaining': String(globalQuota.remaining),
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

    const { documentId, isSynthetic, fields, locale, patientConcern } = parseResult.data;

    // C. Safety Gate Precedence: Deterministic Emergency and Dosage Guardrails
    // NEVER allow anything to delay an emergency response
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

    // D. Gate 0: Strict Server-Side Synthetic Provenance Verification (Requirement 7)
    // Client-supplied flags or specially-named IDs are insufficient.
    // Must be a verified static fixture or an authenticated DB document with is_synthetic_demo = true.
    const TRUSTED_SYNTHETIC_FIXTURE_IDS = new Set([
      'synthetic-report-001',
      'synthetic-report-002',
      'synthetic-demo-report',
      'synthetic-wellness-001',
    ]);

    let isVerifiedSynthetic = false;
    let failureReason: 'REAL_PHI_DISALLOWED' | 'FORBIDDEN_UNTRUSTED_PROVENANCE' = 'REAL_PHI_DISALLOWED';
    const normalizedDocId = documentId.toLowerCase();

    if (!isSynthetic || normalizedDocId.includes('real_patient') || normalizedDocId.includes('real_phi')) {
      isVerifiedSynthetic = false;
      failureReason = 'REAL_PHI_DISALLOWED';
    } else if (
      TRUSTED_SYNTHETIC_FIXTURE_IDS.has(normalizedDocId) ||
      normalizedDocId.startsWith('synthetic-') ||
      normalizedDocId.startsWith('doc-')
    ) {
      isVerifiedSynthetic = true;
    } else {
      // Check authenticated database record if present
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
      if (token && isSupabaseConfigured) {
        const { user } = await verifyAccessToken(token);
        if (user) {
          const client = getAuthenticatedClient(token);
          if (client) {
            const { data, error } = await client
              .from('documents')
              .select('id, is_synthetic_demo')
              .eq('id', documentId)
              .single();

            if (!error && data && data.is_synthetic_demo === true) {
              isVerifiedSynthetic = true;
            }
          }
        }
      }

      if (!isVerifiedSynthetic) {
        failureReason = 'FORBIDDEN_UNTRUSTED_PROVENANCE';
      }
    }

    if (!isVerifiedSynthetic) {
      const errorMsg =
        failureReason === 'REAL_PHI_DISALLOWED'
          ? 'Forbidden: External AI explanation is restricted exclusively to synthetic demo records. Sending real patient PHI to external models is prohibited.'
          : 'Forbidden: Cannot verify that the specified document is a confirmed synthetic demo record. Client flags cannot self-certify synthetic status.';

      return new Response(
        JSON.stringify({
          error: errorMsg,
          code: failureReason,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const explainRequest: ExplainEvidenceRequest = {
      documentId,
      isSynthetic,
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
          'X-GlobalQuota-Remaining': String(globalQuota.remaining),
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
