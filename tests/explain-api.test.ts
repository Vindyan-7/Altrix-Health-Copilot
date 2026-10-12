import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../src/pages/api/copilot/explain';
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

describe('POST /api/copilot/explain Endpoint Guardrails', () => {
  it('rejects payloads exceeding 32 KB with 413 Payload Too Large', async () => {
    // Generate a payload exceeding 32 KB
    const largeName = 'A'.repeat(33 * 1024);
    const body = {
      documentId: 'doc-overflow',
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
    // Empty fields array is invalid (min 1 required)
    const invalidBody = {
      documentId: 'doc-empty-fields',
      fields: [],
    };
    const req = createMockRequest(invalidBody);
    const ctx = createMockContext(req, '192.168.1.102');

    const res = await POST(ctx);
    expect(res.status).toBe(422);

    const json = await res.json();
    expect(json.code).toBe('INVALID_PAYLOAD');
  });

  it('enforces deterministic emergency routing ahead of model generation', async () => {
    const emergencyBody = {
      documentId: 'doc-emergency',
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

  it('enforces rate limiting when exceeding 10 requests per minute per IP', async () => {
    const uniqueIp = '10.99.88.77';
    const validBody = {
      documentId: 'doc-rate-limit',
      fields: [{ name: 'Platelets', value: '250000', unit: '/mcL' }],
    };

    let lastResponse: Response | null = null;
    // Send 11 requests from the same IP
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
  });
});
