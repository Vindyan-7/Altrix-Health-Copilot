import type { APIRoute } from 'astro';
import { z } from 'zod';
import { GeminiProvider } from '../../../lib/ai/gemini-provider';
import { checkEmergency } from '../../../lib/chatbot/routeEmergency';
import { checkDosageInterception } from '../../../lib/chatbot/safetyRules';
import { verifyAccessToken } from '../../../lib/supabase/auth';

export const prerender = false;

// 1. Rate Limiting: 5 requests / 10 min for guests, 20 requests / 10 min for authenticated users
interface ChatRateLimitBucket {
  count: number;
  resetAt: number;
}
const chatRateLimitMap = new Map<string, ChatRateLimitBucket>();
const GUEST_MAX_REQUESTS = 5;
const AUTH_MAX_REQUESTS = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PAYLOAD_BYTES = 16 * 1024; // 16 KB

function pruneExpiredBuckets(now: number) {
  if (chatRateLimitMap.size > 500) {
    for (const [key, bucket] of chatRateLimitMap.entries()) {
      if (now > bucket.resetAt) {
        chatRateLimitMap.delete(key);
      }
    }
  }
}

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number; retryAfterSeconds: number; resetAt: number } {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const bucket = chatRateLimitMap.get(key);
  if (!bucket || now > bucket.resetAt) {
    chatRateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0, resetAt: now + RATE_WINDOW_MS };
  }

  if (bucket.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return { allowed: true, remaining: maxRequests - bucket.count, retryAfterSeconds: 0, resetAt: bucket.resetAt };
}

// 2. Instance-Wide Global Quota Control
let globalChatCount = 0;
let globalChatResetAt = Date.now() + 60 * 1000;
const MAX_GLOBAL_PER_MINUTE = 60;

function checkGlobalChatQuota(): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  if (now > globalChatResetAt) {
    globalChatCount = 1;
    globalChatResetAt = now + 60 * 1000;
    return { allowed: true, remaining: MAX_GLOBAL_PER_MINUTE - 1, retryAfterSeconds: 0 };
  }

  if (globalChatCount >= MAX_GLOBAL_PER_MINUTE) {
    const retryAfterSeconds = Math.ceil((globalChatResetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  globalChatCount++;
  return { allowed: true, remaining: MAX_GLOBAL_PER_MINUTE - globalChatCount, retryAfterSeconds: 0 };
}

// 3. Request Schema
const ChatRequestBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(1000),
      })
    )
    .min(1)
    .max(10),
  locale: z.enum(['en', 'te']).default('en'),
});

const geminiProvider = new GeminiProvider();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    clientAddress ||
    'unknown-client';

  // 1. Instance-wide quota check
  const globalQuota = checkGlobalChatQuota();
  if (!globalQuota.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests: Instance-wide AI chat capacity reached. Please retry shortly.',
        code: 'GLOBAL_QUOTA_EXCEEDED',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(globalQuota.retryAfterSeconds),
          'X-GlobalQuota-Remaining': '0',
        },
      }
    );
  }

  // 2. Check Authentication for Rate Limit Tier
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  let isAuthenticated = false;
  let rateLimitKey = `guest:${clientIp}`;
  let maxRequests = GUEST_MAX_REQUESTS;

  if (token) {
    const { user } = await verifyAccessToken(token);
    if (user) {
      isAuthenticated = true;
      rateLimitKey = `user:${user.id}`;
      maxRequests = AUTH_MAX_REQUESTS;
    }
  }

  // 3. User / IP Rate Limit
  const rateLimit = checkRateLimit(rateLimitKey, maxRequests);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: isAuthenticated
          ? 'Rate limit exceeded: You have reached the authenticated usage limit (20 queries per 10 minutes).'
          : 'Rate limit exceeded: Guest AI usage is limited to 5 queries per 10 minutes. Sign in to unlock higher limits.',
        code: 'RATE_LIMIT_EXCEEDED',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetAt),
          'X-GlobalQuota-Remaining': String(globalQuota.remaining),
        },
      }
    );
  }

  // 4. Content-Length Bounds Check
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return new Response(
      JSON.stringify({
        error: 'Payload Too Large: Chat payload must not exceed 16 KB.',
        code: 'PAYLOAD_TOO_LARGE',
      }),
      { status: 413, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request body', code: 'BAD_REQUEST' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = ChatRequestBodySchema.safeParse(rawBody);
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

    const { messages, locale } = parseResult.data;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    // 5. Pre-Model Safety Gate 1: Emergency Red Flag Interception
    const emergencyMatch = checkEmergency(lastUserMessage);
    if (emergencyMatch) {
      return new Response(
        JSON.stringify({
          message: emergencyMatch.message,
          isEmergency: true,
          isBlockedDosage: false,
          safetyLevel: 'urgent',
          isMockFallback: false,
          provider: 'DeterministicEmergencyEngine',
          disclaimer: emergencyMatch.disclaimer,
          suggestedQuestions: emergencyMatch.quickReplies,
          citations: emergencyMatch.citations,
          locale,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
            'X-GlobalQuota-Remaining': String(globalQuota.remaining),
          },
        }
      );
    }

    // 6. Pre-Model Safety Gate 2: Medication Dosage Refusal
    const dosageMatch = checkDosageInterception(lastUserMessage);
    if (dosageMatch) {
      return new Response(
        JSON.stringify({
          message: dosageMatch.message,
          isEmergency: false,
          isBlockedDosage: true,
          safetyLevel: 'caution',
          isMockFallback: false,
          provider: 'DeterministicSafetyEngine',
          disclaimer: dosageMatch.disclaimer,
          suggestedQuestions: dosageMatch.quickReplies,
          citations: dosageMatch.citations,
          locale,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
            'X-GlobalQuota-Remaining': String(globalQuota.remaining),
          },
        }
      );
    }

    // 7. Invoke Gemini AI Provider with Strict Boundaries
    const aiResponse = await geminiProvider.generateChat({ messages, locale });

    return new Response(
      JSON.stringify({
        message: aiResponse.message,
        isEmergency: false,
        isBlockedDosage: false,
        safetyLevel: 'routine',
        isMockFallback: aiResponse.isMockFallback,
        isUnavailable: aiResponse.isUnavailable ?? aiResponse.isMockFallback,
        provider: aiResponse.provider,
        disclaimer: aiResponse.disclaimer,
        suggestedQuestions: aiResponse.suggestedQuestions || [],
        locale,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
          'X-GlobalQuota-Remaining': String(globalQuota.remaining),
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'An internal error occurred while generating AI response.',
        code: 'INTERNAL_ERROR',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
