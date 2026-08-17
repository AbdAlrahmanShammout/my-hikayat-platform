import { describe, expect, it } from 'vitest';

import { formatAuditMetadata } from '@/features/audit/lib/format-audit-metadata';

describe('formatAuditMetadata', () => {
  it('pretty-prints an object', () => {
    const actualMetadata = formatAuditMetadata({ poolAmountCents: 10000 });
    expect(actualMetadata).toBe('{\n  "poolAmountCents": 10000\n}');
  });

  it('labels missing metadata', () => {
    const actualMetadata = formatAuditMetadata(null);
    expect(actualMetadata).toBe('Not set');
  });
});
