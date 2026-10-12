import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { GeminiProvider } from '../src/lib/ai/gemini-provider';
import { isSupabaseConfigured, getSupabaseClient } from '../src/lib/supabase/client';
import { routeGuestQuery } from '../src/lib/ai/guest-router';
import type { ExplainEvidenceRequest } from '../src/lib/ai/provider';

describe('Environment, Security & AI Provider Foundations', () => {
  describe('Environment Configuration Security', () => {
    it('.env.example contains all required placeholders without leaking secrets', () => {
      const examplePath = path.resolve(process.cwd(), '.env.example');
      const content = fs.readFileSync(examplePath, 'utf-8');

      expect(content).toContain('PUBLIC_SUPABASE_URL');
      expect(content).toContain('PUBLIC_SUPABASE_PUBLISHABLE_KEY');
      expect(content).toContain('GEMINI_API_KEY');
      expect(content).toContain('GEMINI_MODEL');

      // Ensure server secret keys never carry PUBLIC_ prefix
      expect(content).not.toContain('PUBLIC_GEMINI_API_KEY');
      expect(content).not.toContain('PUBLIC_SUPABASE_SERVICE_ROLE_KEY');

      // Ensure placeholders are present
      expect(content).toContain('your-gemini-api-key');
      expect(content).toContain('your-supabase-publishable-key');
    });

    it('.gitignore strictly ignores .env and private environment files', () => {
      const gitignorePath = path.resolve(process.cwd(), '.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf-8');

      expect(content).toMatch(/^\.env$/m);
      expect(content).toMatch(/^\.env\.\*$/m);
      expect(content).toContain('!.env.example');
    });
  });

  describe('Supabase Client Safety', () => {
    it('initializes safely when unconfigured without throwing unhandled errors', () => {
      // Testing with empty or mock values
      expect(typeof isSupabaseConfigured).toBe('boolean');
      const client = getSupabaseClient();
      // Should either be null or a client, but must not crash
      if (!isSupabaseConfigured) {
        expect(client).toBeNull();
      }
    });
  });

  describe('Gemini Provider Lifecycle & Fallback', () => {
    it('reports unconfigured status safely when GEMINI_API_KEY is not provided', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      try {
        delete process.env.GEMINI_API_KEY;
        const provider = new GeminiProvider();
        const health = await provider.healthCheck();

        expect(health.providerName).toBe('GoogleGeminiProvider');
        expect(health.isAvailable).toBe(false);
        expect(health.isMock).toBe(false);
        expect(health.statusMessage).toContain('not configured');
      } finally {
        if (originalKey) process.env.GEMINI_API_KEY = originalKey;
      }
    });

    it('gracefully falls back to deterministic explanation when unconfigured', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      try {
        delete process.env.GEMINI_API_KEY;
        const provider = new GeminiProvider();
        const request: ExplainEvidenceRequest = {
          documentId: 'test-doc-001',
          fields: [
            {
              name: 'Hemoglobin',
              value: 10.8,
              unit: 'g/dL',
              interpretation: 'low',
              referenceRangeText: '12.0 - 15.5 g/dL',
            },
          ],
          locale: 'en',
        };

        const result = await provider.explainEvidence(request);

        expect(result.summary.length).toBeGreaterThan(0);
        expect(result.bulletPoints.length).toBeGreaterThan(0);
        expect(result.suggestedDoctorQuestions.length).toBeGreaterThan(0);
        expect(result.isSyntheticDemo).toBe(true);
        expect(result.evidenceCount).toBe(1);
      } finally {
        if (originalKey) process.env.GEMINI_API_KEY = originalKey;
      }
    });

    it('rejects empty field payloads with a typed error', async () => {
      const provider = new GeminiProvider();
      const emptyRequest: ExplainEvidenceRequest = {
        documentId: 'test-doc-002',
        fields: [],
        locale: 'en',
      };

      await expect(provider.explainEvidence(emptyRequest)).rejects.toThrow();
    });
  });

  describe('Safety Gate Enforcement Ahead of AI Providers', () => {
    it('emergency symptoms take absolute priority and never call AI models', () => {
      const emergencyQuery = 'Severe chest pain radiating to left arm';
      const check = routeGuestQuery(emergencyQuery, 'en');

      expect(check.isEmergency).toBe(true);
      expect(check.intent).toBe('emergency_red_flag');
    });

    it('individualized dosage questions are deterministically blocked ahead of AI models', () => {
      const dosageQuery = 'How many mg of paracetamol can I take for fever?';
      const check = routeGuestQuery(dosageQuery, 'en');

      expect(check.intent).toBe('blocked_dosage_request');
      expect(check.isEmergency).toBe(false);
    });

    it('Telugu emergency symptoms are deterministically escalated', () => {
      const teluguEmergency = 'నాకు విపరీతమైన ఛాతీ నొప్పి వస్తోంది';
      const check = routeGuestQuery(teluguEmergency, 'te');

      expect(check.isEmergency).toBe(true);
      expect(check.intent).toBe('emergency_red_flag');
    });
  });
});
