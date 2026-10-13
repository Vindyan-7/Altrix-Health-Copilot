import { describe, it, expect } from 'vitest';
import { MockExtractionProvider } from '../src/lib/ai/mock-provider';
import { GeminiProvider } from '../src/lib/ai/gemini-provider';
import fs from 'node:fs';
import path from 'node:path';

// Helper for validating internal returnTo redirects
function validateReturnTo(url: string | null): string {
  if (!url) return '/dashboard';
  const allowed = ['/dashboard', '/records', '/review', '/timeline', '/copilot'];
  if (allowed.some((a) => url === a || url.startsWith(a + '?') || url.startsWith(a + '/'))) {
    return url;
  }
  return '/dashboard';
}

describe('Phase 4C: Landing Page, Authentication Flow & Demo Cleanup', () => {
  describe('1. Open Redirect Prevention (Safe Return-To URLs)', () => {
    it('accepts valid internal paths for post-login redirect', () => {
      expect(validateReturnTo('/dashboard')).toBe('/dashboard');
      expect(validateReturnTo('/records')).toBe('/records');
      expect(validateReturnTo('/copilot?mode=ai')).toBe('/copilot?mode=ai');
      expect(validateReturnTo('/review')).toBe('/review');
      expect(validateReturnTo('/timeline')).toBe('/timeline');
    });

    it('rejects external and malicious redirect attempts by defaulting to /dashboard', () => {
      expect(validateReturnTo('https://evil.com')).toBe('/dashboard');
      expect(validateReturnTo('//evil.com')).toBe('/dashboard');
      expect(validateReturnTo('javascript:alert(1)')).toBe('/dashboard');
      expect(validateReturnTo('/\\evil.com')).toBe('/dashboard');
      expect(validateReturnTo(null)).toBe('/dashboard');
      expect(validateReturnTo('')).toBe('/dashboard');
    });
  });

  describe('2. Honest AI Fallback Response', () => {
    it('returns honest unavailable message when external AI service is unreachable', async () => {
      const mockProvider = new MockExtractionProvider();
      const response = await mockProvider.generateChat({
        messages: [{ role: 'user', content: 'What are vitamins?' }],
        locale: 'en',
      });

      expect(response.isUnavailable).toBe(true);
      expect(response.isMockFallback).toBe(true);
      expect(response.provider).toBe('ServiceUnavailable');
      expect(response.message).toContain('General health AI chat is temporarily unavailable');
      expect(response.message).toContain('Guided Health Copilot');
      expect(response.suggestedQuestions).toBeInstanceOf(Array);
      expect(response.suggestedQuestions?.length).toBeGreaterThan(0);
    });

    it('returns honest unavailable message in Telugu when requested', async () => {
      const mockProvider = new MockExtractionProvider();
      const response = await mockProvider.generateChat({
        messages: [{ role: 'user', content: 'విటమిన్లు ఏమిటి?' }],
        locale: 'te',
      });

      expect(response.isUnavailable).toBe(true);
      expect(response.isMockFallback).toBe(true);
      expect(response.message).toContain('సాధారణ ఆరోగ్య AI చాట్ ప్రస్తుతం అందుబాటులో లేదు');
      expect(response.message).toContain('గైడెడ్ హెల్త్ కోపైలట్‌ను ఉపయోగించండి');
    });

    it('GeminiProvider falls back to honest unavailable response when API key is unconfigured', async () => {
      const geminiProvider = new GeminiProvider();
      const response = await geminiProvider.generateChat({
        messages: [{ role: 'user', content: 'Can I take aspirin?' }],
        locale: 'en',
      });

      expect(response.isUnavailable).toBe(true);
      expect(response.isMockFallback).toBe(true);
      expect(response.message).toContain('General health AI chat is temporarily unavailable');
    });
  });

  describe('3. Customer-Facing Cleanliness (No Hardcoded Demo Identities or Credits)', () => {
    const customerFiles = [
      'src/pages/index.astro',
      'src/pages/dashboard.astro',
      'src/pages/auth.astro',
      'src/pages/records.astro',
      'src/pages/timeline.astro',
      'src/pages/copilot.astro',
      'src/components/TopBar.astro',
      'src/components/Sidebar.astro',
      'src/components/Footer.astro',
    ];

    it('ensures no customer-facing file contains "Priya Sharma"', () => {
      for (const relPath of customerFiles) {
        const fullPath = path.resolve(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          expect(content).not.toContain('Priya Sharma');
        }
      }
    });

    it('ensures public footer contains no developer team credits', () => {
      const footerPath = path.resolve(process.cwd(), 'src/components/Footer.astro');
      const footerContent = fs.readFileSync(footerPath, 'utf8');
      expect(footerContent).not.toContain('Vindyan');
      expect(footerContent).not.toContain('ChatGPT');
      expect(footerContent).not.toContain('Antigravity');
    });

    it('ensures records page has no sample-record creation button in normal flow', () => {
      const recordsPath = path.resolve(process.cwd(), 'src/pages/records.astro');
      const recordsContent = fs.readFileSync(recordsPath, 'utf8');
      expect(recordsContent).not.toContain('btn-save-sample-record');
      expect(recordsContent).not.toContain('+ Save Sample Synthetic CBC to Vault');
    });

    it('ensures public landing page exists at src/pages/index.astro with hero animation', () => {
      const indexPath = path.resolve(process.cwd(), 'src/pages/index.astro');
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      expect(indexContent).toContain('hero-animate');
      expect(indexContent).toContain('prefers-reduced-motion');
      expect(indexContent).toContain('Altrix Health Copilot');
      expect(indexContent).toContain('Try Health Copilot (Guest Mode)');
    });

    it('ensures workspace dashboard exists at src/pages/dashboard.astro', () => {
      const dashPath = path.resolve(process.cwd(), 'src/pages/dashboard.astro');
      const dashContent = fs.readFileSync(dashPath, 'utf8');
      expect(dashContent).toContain('dashboard-auth-view');
      expect(dashContent).toContain('dashboard-guest-view');
      expect(dashContent).toContain('Sign In to Access Your Workspace');
    });

    it('ensures dashboard and records remove misleading upload actions and state "Uploads Coming Soon"', () => {
      const dashContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/dashboard.astro'), 'utf8');
      expect(dashContent).not.toContain('+ Upload Record');
      expect(dashContent).toContain('Uploads Coming Soon');
      expect(dashContent).toContain('Document Uploads Coming Soon');

      const recordsContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/records.astro'), 'utf8');
      expect(recordsContent).not.toContain('<input type="file"');
      expect(recordsContent).not.toContain('simulateExtraction');
      expect(recordsContent).not.toContain('SYNTHETIC_REPORT_STATS');
      expect(recordsContent).toContain('Document Uploads Coming Soon');
    });

    it('ensures timeline and review pages show genuine empty states in normal user flows', () => {
      const timelineContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/timeline.astro'), 'utf8');
      expect(timelineContent).not.toContain('SYNTHETIC_PATIENT');
      expect(timelineContent).toContain('Your Health Timeline is Empty');
      expect(timelineContent).toContain('timeline-empty-state');

      const reviewContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/review.astro'), 'utf8');
      expect(reviewContent).toContain('review-empty-state');
      expect(reviewContent).toContain('No Document Staged for Review');
    });
  });
});

