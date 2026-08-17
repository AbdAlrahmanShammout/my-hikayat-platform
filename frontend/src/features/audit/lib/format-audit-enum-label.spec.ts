import { describe, expect, it } from 'vitest';

import { formatAuditEnumLabel } from '@/features/audit/lib/format-audit-enum-label';

describe('formatAuditEnumLabel', () => {
  it('formats an action wire value', () => {
    const actualLabel = formatAuditEnumLabel('book_approved');
    expect(actualLabel).toBe('Book approved');
  });

  it('formats a subject type', () => {
    const actualLabel = formatAuditEnumLabel('revenue_period');
    expect(actualLabel).toBe('Revenue period');
  });
});
