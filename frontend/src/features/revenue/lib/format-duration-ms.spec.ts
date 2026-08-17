import { describe, expect, it } from 'vitest';

import { formatDurationMs } from '@/features/revenue/lib/format-duration-ms';

describe('formatDurationMs', () => {
  it('labels the integer millisecond value', () => {
    const actualLabel = formatDurationMs(180000);
    expect(actualLabel).toBe('180000 ms');
  });
});
