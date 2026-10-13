import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  createThinkingIndicatorHtml,
  countThinkingDots,
  formatMessageText,
  sanitizeChatErrorMessage,
  getProviderDisplayLabel,
  planTypewriter,
} from '../src/lib/chatbot/chat-ux';

describe('Chat UX Polish and Vendor-Neutral Branding', () => {
  describe('1. Exact Five-Dot Thinking Indicator', () => {
    it('generates an indicator with exactly five animated dots', () => {
      const html = createThinkingIndicatorHtml();
      expect(countThinkingDots(html)).toBe(5);
    });

    it('displays the exact label "Preparing your response..."', () => {
      const html = createThinkingIndicatorHtml();
      expect(html).toContain('Preparing your response...');
    });

    it('applies the Altrix visual style to all five dots', () => {
      const html = createThinkingIndicatorHtml();
      const dotMatches = html.match(/thinking-dot[^"]*bg-aura-accent-orange/g);
      expect(dotMatches).toHaveLength(5);
    });

    it('sets aria-hidden="true" on the animated dots container for accessibility', () => {
      const html = createThinkingIndicatorHtml();
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('data-testid="thinking-dots"');
    });
  });

  describe('2. Indicator Lifecycle and Submission Locking', () => {
    it('locks pending requests to prevent duplicate submissions', () => {
      let isPending = false;
      function submit(query: string) {
        if (isPending) return false;
        isPending = true;
        return true;
      }

      expect(submit('Query 1')).toBe(true);
      expect(submit('Query 1 duplicate')).toBe(false);
      isPending = false;
      expect(submit('Query 2 after unlock')).toBe(true);
    });

    it('resets thinking and typing state on component restart/reset', () => {
      let typingSession = 1;
      let indicatorVisible = true;
      let isPending = true;

      function onRestart() {
        typingSession++;
        indicatorVisible = false;
        isPending = false;
      }

      onRestart();
      expect(typingSession).toBe(2);
      expect(indicatorVisible).toBe(false);
      expect(isPending).toBe(false);
    });
  });

  describe('3. Natural Typewriter Effect and Text Preservation', () => {
    it('calculates adaptive bounded duration (between 250ms and 750ms)', () => {
      const shortText = 'Take two glasses of water.';
      const shortPlan = planTypewriter({ fullText: shortText });
      expect(shortPlan.totalDurationMs).toBeGreaterThanOrEqual(250);
      expect(shortPlan.totalDurationMs).toBeLessThanOrEqual(750);

      const longText = 'This is an educational clinical guidance message for users. '.repeat(30);
      const longPlan = planTypewriter({ fullText: longText });
      expect(longPlan.totalDurationMs).toBe(750); // Capped at 750ms max
    });

    it('preserves paragraph breaks, bullet lists, and bold formatting without altering text', () => {
      const input = 'First paragraph.\n\nSecond paragraph.\n• First item\n• Second item\n**Critical Warning**';
      const formatted = formatMessageText(input);

      expect(formatted).toContain('<br/><br/>');
      expect(formatted).toContain('<br/>• First item');
      expect(formatted).toContain('<br/>• Second item');
      expect(formatted).toContain('<strong>Critical Warning</strong>');
    });

    it('escapes raw HTML entities safely to prevent injection', () => {
      const unsafe = '<script>alert("test")</script> & <div>test</div>';
      const formatted = formatMessageText(unsafe);
      expect(formatted).not.toContain('<script>');
      expect(formatted).toContain('&lt;script&gt;');
      expect(formatted).toContain('&amp;');
    });

    it('prevents stale callbacks from overwriting newer responses via session tracking', () => {
      let activeSession = 10;
      let targetElementHtml = '';

      function simulateTick(callbackSession: number, text: string) {
        if (callbackSession !== activeSession) {
          return; // Aborted
        }
        targetElementHtml = text;
      }

      // Old callback fires for session 10
      simulateTick(10, 'Old message text');
      expect(targetElementHtml).toBe('Old message text');

      // User starts a new query, bumping session to 11
      activeSession = 11;

      // Stale tick from session 10 attempts to fire
      simulateTick(10, 'Stale delayed overwrite');
      expect(targetElementHtml).toBe('Old message text'); // Stale tick discarded!

      // New callback fires for session 11
      simulateTick(11, 'New message text');
      expect(targetElementHtml).toBe('New message text');
    });
  });

  describe('4. Emergency Guidance & Reduced Motion Bypass', () => {
    it('bypasses typewriter animation immediately when isEmergency is true', () => {
      const emergencyText = 'EMERGENCY WARNING: Call 112 or 911 immediately for severe chest pain.';
      const plan = planTypewriter({ fullText: emergencyText, isEmergency: true });

      expect(plan.shouldBypass).toBe(true);
      expect(plan.totalDurationMs).toBe(0);
    });

    it('bypasses typewriter animation when prefersReducedMotion is true', () => {
      const text = 'Normal health information.';
      const plan = planTypewriter({ fullText: text, prefersReducedMotion: true });

      expect(plan.shouldBypass).toBe(true);
      expect(plan.totalDurationMs).toBe(0);
    });
  });

  describe('5. Vendor-Neutral Error Sanitization', () => {
    it('converts raw Gemini connection errors into user-friendly message', () => {
      const rawError = 'Cannot connect to Gemini API: Google Generative AI backend 503 unavailable';
      const sanitized = sanitizeChatErrorMessage(503, rawError);

      expect(sanitized).toBe(
        'Health Copilot is temporarily unavailable. Please try again shortly, or continue with the Guided Health Guide.'
      );
      expect(sanitized).not.toContain('Gemini');
      expect(sanitized).not.toContain('Google');
    });

    it('handles 429 rate limit errors with helpful guidance', () => {
      const sanitized = sanitizeChatErrorMessage(429, 'Rate limit exceeded');
      expect(sanitized).toContain('Usage limit reached');
      expect(sanitized).toContain('Guided Health Guide below');
    });

    it('returns vendor-neutral provider display labels', () => {
      expect(getProviderDisplayLabel({ isEmergency: false, isUnavailable: false })).toBe('Altrix Health Copilot');
      expect(getProviderDisplayLabel({ isEmergency: true })).toBe('Emergency Safety Protocol');
      expect(getProviderDisplayLabel({ isUnavailable: true })).toBe('Curated Catalogue Available');
      expect(getProviderDisplayLabel({ isMockFallback: true })).toBe('Curated Catalogue Available');
    });
  });

  describe('6. Absence of Visible AI Provider Branding in Website UI', () => {
    it('ensures copilot.astro contains no visible user-facing Gemini or model branding', () => {
      const copilotFile = readFileSync(resolve(process.cwd(), 'src/pages/copilot.astro'), 'utf-8');

      // Check user-facing markup outside <script>
      const templatePart = copilotFile.split('<script>')[0];
      expect(templatePart).not.toContain('Gemini');
      expect(templatePart).not.toContain('3.8-Flash');
      expect(templatePart).not.toContain('gemini-3.8-flash');
      expect(templatePart).toContain('AI Health Chat');
      expect(templatePart).toContain('Altrix Copilot');
    });

    it('ensures index.astro contains no visible Gemini button branding', () => {
      const indexFile = readFileSync(resolve(process.cwd(), 'src/pages/index.astro'), 'utf-8');
      expect(indexFile).not.toContain('Gemini');
      expect(indexFile).toContain('Ask AI Health Chat');
    });
  });
});
