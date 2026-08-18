import { describe, expect, it } from 'vitest';

import { formatBookAssetFileName } from '@/features/books/lib/format-book-asset-file-name';

describe('formatBookAssetFileName', () => {
  it('returns the original file name when the API sent one', () => {
    const actualName = formatBookAssetFileName('cover.png');
    expect(actualName).toBe('cover.png');
  });

  it('returns Unnamed file when the API omitted the name', () => {
    const actualName = formatBookAssetFileName(null);
    expect(actualName).toBe('Unnamed file');
  });
});
