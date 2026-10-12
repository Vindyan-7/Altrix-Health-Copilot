/**
 * Input normalization for predictable intent matching
 * Lowercase, trim, strip punctuation, collapse whitespace.
 */
export function normalizeInput(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a normalized text contains a trigger phrase with word boundaries.
 */
export function matchesWordBoundary(text: string, trigger: string): boolean {
  const normalizedTrigger = normalizeInput(trigger);
  if (!normalizedTrigger) return false;

  // Escape regex special chars in trigger
  const escaped = normalizedTrigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
  return regex.test(text);
}
