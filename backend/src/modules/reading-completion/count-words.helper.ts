/**
 * Counts words in stored book text. Whitespace separates words for Arabic and Latin text.
 */
export function countWords(text: string): number {
  const trimmed: string = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(/\s+/u).length;
}
