import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../src/pages/api/copilot/explain';
import { GeminiProvider } from '../src/lib/ai/gemini-provider';
import type { APIContext } from 'astro';

function createMockRequest(body: any, headers: Record<string, string> = {}): Request {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Content-Length': String(Buffer.byteLength(bodyStr, 'utf-8')),
    ...headers,
  };

  return new Request('http://localhost:4321/api/copilot/explain', {
    method: 'POST',
    headers: defaultHeaders,
    body: bodyStr,
  });
}

function createMockContext(request: Request, clientAddress: string = '127.0.0.1'): APIContext {
  return {
    request,
    clientAddress,
    params: {},
    props: {},
    site: undefined,
    generator: 'astro',
    url: new URL(request.url),
    cookies: {} as any,
    redirect: (() => {}) as any,
    locals: {},
  } as unknown as APIContext;
}

describe('Phase 3: Controlled AI Explanation & Safety Guardrails', () => {
  describe('A. Input Bounds & Request Validation', () => {
    it('rejects payloads exceeding 32 KB with 413 Payload Too Large', async () => {
      const largeName = 'A'.repeat(33 * 1024);
      const body = {
        documentId: 'synthetic-doc-001',
        isSynthetic: true,
        fields: [{ name: largeName, value: '10' }],
      };
      const req = createMockRequest(body);
      const ctx = createMockContext(req, '192.168.1.100');

      const res = await POST(ctx);
      expect(res.status).toBe(413);

      const json = await res.json();
      expect(json.code).toBe('PAYLOAD_TOO_LARGE');
      expect(json.error).toContain('32 KB');
    });

    it('rejects malformed JSON with 400 Bad Request', async () => {
      const rawReq = new Request('http://localhost:4321/api/copilot/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '15',
        },
        body: '{ not valid json',
      });
      const ctx = createMockContext(rawReq, '192.168.1.101');

      const res = await POST(ctx);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.code).toBe('BAD_REQUEST');
    });

    it('rejects invalid payload structures with 422 Unprocessable Entity', async () => {
      const invalidBody = {
        documentId: 'synthetic-doc-002',
        fields: [], // min 1 required
      };
      const req = createMockRequest(invalidBody);
      const ctx = createMockContext(req, '192.168.1.102');

      const res = await POST(ctx);
      expect(res.status).toBe(422);

      const json = await res.json();
      expect(json.code).toBe('INVALID_PAYLOAD');
    });
  });

  describe('B. Gate 0: Strict Synthetic-Only Restriction (PHI Protection)', () => {
    it('rejects non-synthetic records with 403 REAL_PHI_DISALLOWED', async () => {
      const realPatientBody = {
        documentId: 'real_patient_record_123',
        isSynthetic: false, // Explicitly non-synthetic
        fields: [{ name: 'Hemoglobin', value: 13.5, unit: 'g/dL' }],
        locale: 'en',
      };
      const req = createMockRequest(realPatientBody);
      const ctx = createMockContext(req, '192.168.1.110');

      const res = await POST(ctx);
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json.code).toBe('REAL_PHI_DISALLOWED');
      expect(json.error).toContain('restricted exclusively to synthetic demo records');
    });

    it('rejects documentId containing real_patient even if isSynthetic flag is omitted', async () => {
      const spoofedBody = {
        documentId: 'REAL_PATIENT_HOSPITAL_SCAN',
        fields: [{ name: 'Glucose', value: 140, unit: 'mg/dL' }],
        locale: 'en',
      };
      const req = createMockRequest(spoofedBody);
      const ctx = createMockContext(req, '192.168.1.111');

      const res = await POST(ctx);
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json.code).toBe('REAL_PHI_DISALLOWED');
    });

    it('GeminiProvider directly throws REAL_PHI_DISALLOWED if request isSynthetic is false', async () => {
      const provider = new GeminiProvider();
      await expect(
        provider.explainEvidence({
          documentId: 'doc-real',
          isSynthetic: false,
          fields: [{ name: 'Glucose', value: 100 }],
          locale: 'en',
        })
      ).rejects.toThrow('REAL_PHI_DISALLOWED');
    });
  });

  describe('C. Safety Gates: Priority Over External AI Model', () => {
    it('enforces deterministic emergency routing ahead of model generation', async () => {
      const emergencyBody = {
        documentId: 'doc-emergency',
        isSynthetic: true,
        fields: [{ name: 'Troponin', value: '0.08', unit: 'ng/mL' }],
        patientConcern: 'Severe crushing chest pain and shortness of breath',
        locale: 'en',
      };
      const req = createMockRequest(emergencyBody);
      const ctx = createMockContext(req, '192.168.1.103');

      const res = await POST(ctx);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.isEmergency).toBe(true);
      expect(json.summary).toContain('CRITICAL EMERGENCY WARNING');
      expect(json.summary).toContain('112 / 108');
    });

    it('enforces deterministic dosage refusal ahead of model generation', async () => {
      const dosageBody = {
        documentId: 'doc-dosage',
        isSynthetic: true,
        fields: [{ name: 'Temperature', value: '102', unit: 'F' }],
        patientConcern: 'What is the dosage for my child with fever?',
        locale: 'en',
      };
      const req = createMockRequest(dosageBody);
      const ctx = createMockContext(req, '192.168.1.104');

      const res = await POST(ctx);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.isBlockedDosage).toBe(true);
      expect(json.summary).toContain('Clinical Safety Policy');
      expect(json.summary).toContain('cannot recommend individual dosages');
    });
  });

  describe('D. Rate Limiting & Deployed Quota Control', () => {
    it('enforces rate limiting when exceeding 10 requests per minute per IP', async () => {
      const uniqueIp = '10.99.88.77';
      const validBody = {
        documentId: 'doc-rate-limit',
        isSynthetic: true,
        fields: [{ name: 'Platelets', value: '250000', unit: '/mcL' }],
      };

      let lastResponse: Response | null = null;
      for (let i = 0; i < 11; i++) {
        const req = createMockRequest(validBody);
        const ctx = createMockContext(req, uniqueIp);
        lastResponse = await POST(ctx);
      }

      expect(lastResponse).not.toBeNull();
      expect(lastResponse!.status).toBe(429);

      const json = await lastResponse!.json();
      expect(json.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(lastResponse!.headers.get('Retry-After')).toBeTruthy();
      expect(lastResponse!.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(lastResponse!.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('returns rate limit headers on successful requests', async () => {
      const uniqueIp = '10.99.77.66';
      const validBody = {
        documentId: 'doc-headers-test',
        isSynthetic: true,
        fields: [{ name: 'Glucose', value: '95', unit: 'mg/dL' }],
      };
      const req = createMockRequest(validBody);
      const ctx = createMockContext(req, uniqueIp);

      const res = await POST(ctx);
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(res.headers.get('X-RateLimit-Remaining')).toBeTruthy();
      expect(res.headers.get('X-GlobalQuota-Remaining')).toBeTruthy();
    });
  });

  describe('E. Valid Synthetic Input & Deterministic Fallbacks', () => {
    it('generates valid explanation with synthetic assertions for legitimate payload', async () => {
      const validBody = {
        documentId: 'synthetic-cbc-001',
        isSynthetic: true,
        fields: [
          { name: 'Hemoglobin', value: 11.5, unit: 'g/dL', interpretation: 'low', referenceRangeText: '12.0 - 15.5' },
          { name: 'Fasting Blood Sugar', value: 126, unit: 'mg/dL', interpretation: 'high', referenceRangeText: '70 - 99' },
        ],
        locale: 'en',
      };
      const req = createMockRequest(validBody);
      const ctx = createMockContext(req, '10.20.30.40');

      const res = await POST(ctx);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.isSyntheticDemo).toBe(true);
      expect(json.summary).toBeTruthy();
      expect(json.bulletPoints.length).toBeGreaterThan(0);
      expect(json.suggestedDoctorQuestions.length).toBeGreaterThan(0);
      expect(json.clinicalDisclaimer).toBeTruthy();
    });

    it('GeminiProvider falls back gracefully when API key is missing', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      try {
        delete process.env.GEMINI_API_KEY;
        const provider = new GeminiProvider();
        const res = await provider.explainEvidence({
          documentId: 'synth-missing-key',
          isSynthetic: true,
          fields: [{ name: 'Platelets', value: 200000, unit: '/mcL' }],
          locale: 'en',
        });

        expect(res.isSyntheticDemo).toBe(true);
        expect(res.summary).toBeTruthy();
      } finally {
        if (originalKey) process.env.GEMINI_API_KEY = originalKey;
      }
    });

    it('GeminiProvider handles upstream quota exhaustion (429) gracefully with fallback', async () => {
      const provider = new GeminiProvider();
      // Test when fetch throws or returns 429
      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          json: async () => ({ error: { message: 'Resource exhausted' } }),
        } as Response);

        const res = await provider.explainEvidence({
          documentId: 'synth-quota-exhausted',
          isSynthetic: true,
          fields: [{ name: 'TSH', value: 5.8, unit: 'uIU/mL', interpretation: 'high' }],
          locale: 'en',
        });

        expect(res.isSyntheticDemo).toBe(true);
        expect(res.summary).toBeTruthy();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('GeminiProvider handles provider timeout gracefully with fallback', async () => {
      const provider = new GeminiProvider();
      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = vi.fn().mockImplementation(() => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          return Promise.reject(err);
        });

        const res = await provider.explainEvidence({
          documentId: 'synth-timeout',
          isSynthetic: true,
          fields: [{ name: 'HbA1c', value: 6.4, unit: '%' }],
          locale: 'en',
        });

        expect(res.isSyntheticDemo).toBe(true);
        expect(res.summary).toBeTruthy();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('GeminiProvider handles malformed model output gracefully with fallback', async () => {
      const provider = new GeminiProvider();
      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: 'NOT VALID JSON AT ALL' }],
                },
              },
            ],
          }),
        } as Response);

        const res = await provider.explainEvidence({
          documentId: 'synth-malformed',
          isSynthetic: true,
          fields: [{ name: 'Uric Acid', value: 7.2, unit: 'mg/dL' }],
          locale: 'en',
        });

        expect(res.isSyntheticDemo).toBe(true);
        expect(res.summary).toBeTruthy();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
