import { describe, expect, it } from 'vitest';

import { getAdminAuditSubjectPath } from '@/features/audit/lib/get-admin-audit-subject-path';

describe('getAdminAuditSubjectPath', () => {
  it('maps a book subject to the books screen', () => {
    const actualPath = getAdminAuditSubjectPath('book', 8);
    expect(actualPath).toBe('/admin/books/8');
  });

  it('maps remaining admin subjects', () => {
    expect(getAdminAuditSubjectPath('user', 3)).toBe('/admin/users/3');
    expect(getAdminAuditSubjectPath('subscription', 7)).toBe('/admin/subscriptions/7');
    expect(getAdminAuditSubjectPath('collection', 2)).toBe('/admin/collections/2');
  });

  it('maps a revenue period subject to the revenue screen', () => {
    const actualPath = getAdminAuditSubjectPath('revenue_period', 4);
    expect(actualPath).toBe('/admin/revenue/4');
  });

  it('returns null for an unknown subject type', () => {
    const actualPath = getAdminAuditSubjectPath('category', 1);
    expect(actualPath).toBeNull();
  });

  it('does not treat object prototype keys as subjects', () => {
    const actualPath = getAdminAuditSubjectPath('toString', 1);
    expect(actualPath).toBeNull();
  });
});
