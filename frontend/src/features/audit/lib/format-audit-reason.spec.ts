import { describe, expect, it } from 'vitest';

import { formatAuditReason } from '@/features/audit/lib/format-audit-reason';

describe('formatAuditReason', () => {
  it('returns the reason text', () => {
    const actualReason = formatAuditReason('Cover art does not meet catalog standards');
    expect(actualReason).toBe('Cover art does not meet catalog standards');
  });

  it('labels a missing reason', () => {
    const actualReason = formatAuditReason(null);
    expect(actualReason).toBe('Not set');
  });
});
