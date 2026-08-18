import { describe, expect, it } from 'vitest';

import { formatAuthorCentsLabel } from '@/features/earnings/lib/format-author-cents-label';

describe('formatAuthorCentsLabel', () => {
  it('shows USD and the integer cents from the API', () => {
    const actualLabel = formatAuthorCentsLabel(7000);
    expect(actualLabel).toBe('$70.00 (7000 cents)');
  });
});
