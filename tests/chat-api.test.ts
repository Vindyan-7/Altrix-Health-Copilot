import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../src/pages/api/copilot/chat';
import type { APIContext } from 'astro';

function createMockRequest(body: unknown, options: { headers?: Record<string, string>; contentLength?: number } = {}): Request {
  const serialized = typeof body === 'string' ? body : JSON.stringify(body);
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  });

  if (options.contentLength) {
    headers.set('Content-Length', String(options.contentLength));
  }

  return new Request('https://altrix-health-copilot.vercel.app/api/copilot/chat', {
    method: 'POST',
    headers,
    body: serialized,
  });
}

function createMockContext(request: Request, clientIp = '127.0.0.1'): APIContext {
  return {
    request,
    clientAddress: clientIp,
    params: {},
    props: {},
    site: undefined,
    generator: 'astro',
    url: new URL(request.url),
    cookies: {} as any,
    redirect: vi.fn() as any,
    locals: {},
  } as unknown as APIContext;
}

describe('General Health AI Chat Endpoint (/api/copilot/chat)', () => {
  describe('1. Input Validation & Request Bounds', () => {
    it('rejects payloads exceeding 16 KB with 413 Payload Too Large', async () => {
      const largeContent = 'a'.repeat(17 * 1024);
      const req = createMockRequest({ messages: [{ role: 'user', content: largeContent }] }, { contentLength: 18 * 1024 });
      const ctx = createMockContext(req);

      const res = await POST(ctx);
      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.code).toBe('PAYLOAD_TOO_LARGE');
    });

    it('rejects malformed JSON with 400 Bad Request', async () => {
      const req = createMockRequest('{ not valid json', {});
      const ctx = createMockContext(req);

      const res = await POST(ctx);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('BAD_REQUEST');
    });

    it('rejects invalid payload schemas with 422 Unprocessable Entity', async () => {
      const req = createMockRequest({ messages: [] });
      const ctx = createMockContext(req);

      const res = await POST(ctx);
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.code).toBe('INVALID_PAYLOAD');
    });
  });

  describe('2. Pre-Model Safety Gates (Deterministic Precedence)', () => {
    it('intercepts chest pain as an emergency without invoking AI model', async () => {
      const req = createMockRequest({
        messages: [{ role: 'user', content: 'I have severe chest pain and tight chest' }],
      });
      const ctx = createMockContext(req, '10.0.0.1');

      const res = await POST(ctx);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.isEmergency).toBe(true);
      expect(json.safetyLevel).toBe('urgent');
      expect(json.message).toContain('EMERGENCY WARNING');
      expect(json.message).toContain('112');
      expect(json.provider).toBe('DeterministicEmergencyEngine');
    });

    it('intercepts stroke symptoms as an emergency', async () => {
      const req = createMockRequest({
        messages: [{ role: 'user', content: 'My face is drooping and my speech is slurred' }],
      });
      const ctx = createMockContext(req, '10.0.0.2');

      const res = await POST(ctx);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.isEmergency).toBe(true);
      expect(json.safetyLevel).toBe('urgent');
    });

    it('intercepts medication dosage requests with deterministic refusal', async () => {
      const req = createMockRequest({
        messages: [{ role: 'user', content: 'How many mg of paracetamol can I take for fever?' }],
      });
      const ctx = createMockContext(req, '10.0.0.3');

      const res = await POST(ctx);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.isBlockedDosage).toBe(true);
      expect(json.safetyLevel).toBe('caution');
      expect(json.message).toContain('MEDICATION SAFETY NOTICE');
      expect(json.provider).toBe('DeterministicSafetyEngine');
    });
  });

  describe('3. Rate Limiting & Quotas', () => {
    it('enforces guest rate limiting (5 requests per 10 minutes)', async () => {
      const testIp = '192.168.99.1';

      for (let i = 0; i < 5; i++) {
        const req = createMockRequest({
          messages: [{ role: 'user', content: `Healthy lifestyle inquiry ${i}` }],
        });
        const ctx = createMockContext(req, testIp);
        const res = await POST(ctx);
        expect(res.status).toBe(200);
      }

      // 6th request should exceed limit
      const reqLocked = createMockRequest({
        messages: [{ role: 'user', content: 'Over limit question' }],
      });
      const ctxLocked = createMockContext(reqLocked, testIp);
      const resLocked = await POST(ctxLocked);

      expect(resLocked.status).toBe(429);
      const json = await resLocked.json();
      expect(json.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(resLocked.headers.get('Retry-After')).toBeDefined();
    });

    it('returns rate limit and global quota headers on success', async () => {
      const req = createMockRequest({
        messages: [{ role: 'user', content: 'General preventive wellness tips' }],
      });
      const ctx = createMockContext(req, '172.16.0.50');

      const res = await POST(ctx);
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(res.headers.get('X-GlobalQuota-Remaining')).toBeDefined();
    });
  });

  describe('4. General Educational Health Output & Fallbacks', () => {
    it('returns structured educational answer with disclaimer', async () => {
      const req = createMockRequest({
        messages: [{ role: 'user', content: 'What are general causes of feeling tired during winter?' }],
      });
      const ctx = createMockContext(req, '10.20.30.40');

      const res = await POST(ctx);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.message).toBeDefined();
      expect(json.message.length).toBeGreaterThan(20);
      expect(json.safetyLevel).toBe('routine');
      expect(json.disclaimer).toContain('Educational guidance only');
      expect(json.suggestedQuestions).toBeInstanceOf(Array);
    });

    it('supports Telugu responses for general queries', async () => {
      const req = createMockRequest({
        messages: [{ role: 'user', content: 'సాధారణ ఆరోగ్య అలవాట్లు ఏమిటి?' }],
        locale: 'te',
      });
      const ctx = createMockContext(req, '10.20.30.41');

      const res = await POST(ctx);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.locale).toBe('te');
      expect(json.message.length).toBeGreaterThan(10);
    });
  });
});
