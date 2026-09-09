import { describe, expect, it } from 'vitest';

import { resolveBookCoverUrl } from '@/lib/resolve-book-cover-url';

describe('resolveBookCoverUrl', () => {
  it('returns the signed cover URL when the API sent one', () => {
    const actualUrl = resolveBookCoverUrl({ url: 'https://cdn.example.com/cover.jpg' });
    expect(actualUrl).toBe('https://cdn.example.com/cover.jpg');
  });

  it('returns null when cover is missing', () => {
    expect(resolveBookCoverUrl(null)).toBeNull();
    expect(resolveBookCoverUrl(undefined)).toBeNull();
  });

  it('returns null when the URL is blank', () => {
    const actualUrl = resolveBookCoverUrl({ url: '   ' });
    expect(actualUrl).toBeNull();
  });
});
