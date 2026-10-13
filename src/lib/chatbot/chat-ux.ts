/**
 * Altrix Health Copilot - Chat UX & Animation Helpers
 * Pure logic and utilities for:
 * - 5-dot staggered thinking indicator
 * - Natural progressive typewriter effect with emergency/reduced-motion bypass
 * - Vendor-neutral display labels and error sanitation
 */

export function createThinkingIndicatorHtml(): string {
  return `
    <div class="flex items-center gap-2">
      <span class="font-medium text-aura-text">Preparing your response...</span>
      <span class="inline-flex items-center gap-1" aria-hidden="true" data-testid="thinking-dots">
        <span class="thinking-dot w-1.5 h-1.5 rounded-full bg-aura-accent-orange inline-block"></span>
        <span class="thinking-dot w-1.5 h-1.5 rounded-full bg-aura-accent-orange inline-block"></span>
        <span class="thinking-dot w-1.5 h-1.5 rounded-full bg-aura-accent-orange inline-block"></span>
        <span class="thinking-dot w-1.5 h-1.5 rounded-full bg-aura-accent-orange inline-block"></span>
        <span class="thinking-dot w-1.5 h-1.5 rounded-full bg-aura-accent-orange inline-block"></span>
      </span>
    </div>
  `.trim();
}

export function countThinkingDots(html: string): number {
  const matches = html.match(/class="[^"]*thinking-dot[^"]*"/g);
  return matches ? matches.length : 0;
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatMessageText(text: string): string {
  return escapeHtml(text)
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n•/g, '<br/>•')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export function sanitizeChatErrorMessage(status?: number, rawError?: string): string {
  const GENERIC_UNAVAILABLE =
    'Health Copilot is temporarily unavailable. Please try again shortly, or continue with the Guided Health Guide.';
  const RATE_LIMIT_MESSAGE =
    'Usage limit reached. Please wait a moment before trying again, or continue with the Guided Health Guide below.';

  if (status === 429) {
    return RATE_LIMIT_MESSAGE;
  }

  const lower = (rawError || '').toLowerCase();
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return RATE_LIMIT_MESSAGE;
  }

  // Any provider-specific error (Gemini, Google, 500, network failure) is sanitized
  return GENERIC_UNAVAILABLE;
}

export function getProviderDisplayLabel(params: {
  isUnavailable?: boolean;
  isMockFallback?: boolean;
  isEmergency?: boolean;
}): string {
  if (params.isUnavailable || params.isMockFallback) {
    return 'Curated Catalogue Available';
  }
  if (params.isEmergency) {
    return 'Emergency Safety Protocol';
  }
  return 'Altrix Health Copilot';
}

export interface TypewriterPlan {
  totalDurationMs: number;
  tickIntervalMs: number;
  tokensPerTick: number;
  tokens: string[];
  shouldBypass: boolean;
}

export function planTypewriter(params: {
  fullText: string;
  isEmergency?: boolean;
  prefersReducedMotion?: boolean;
}): TypewriterPlan {
  const { fullText, isEmergency, prefersReducedMotion } = params;

  if (isEmergency || prefersReducedMotion || !fullText) {
    return {
      totalDurationMs: 0,
      tickIntervalMs: 0,
      tokensPerTick: fullText ? fullText.length : 0,
      tokens: [fullText],
      shouldBypass: true,
    };
  }

  const tokens = fullText.split(/(\s+)/);
  if (tokens.length <= 1) {
    return {
      totalDurationMs: 0,
      tickIntervalMs: 0,
      tokensPerTick: tokens.length,
      tokens,
      shouldBypass: true,
    };
  }

  // Adaptive bounded duration: min 250ms, max 750ms
  const targetDuration = Math.min(750, Math.max(250, fullText.length * 1.5));
  const tickIntervalMs = 20;
  const totalTicks = Math.max(1, Math.ceil(targetDuration / tickIntervalMs));
  const tokensPerTick = Math.max(1, Math.ceil(tokens.length / totalTicks));

  return {
    totalDurationMs: targetDuration,
    tickIntervalMs,
    tokensPerTick,
    tokens,
    shouldBypass: false,
  };
}
