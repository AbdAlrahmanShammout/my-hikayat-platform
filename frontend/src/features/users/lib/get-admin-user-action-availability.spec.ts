import { describe, expect, it } from 'vitest';

import { getAdminUserActionAvailability } from '@/features/users/lib/get-admin-user-action-availability';

describe('getAdminUserActionAvailability', () => {
  it('blocks the signed-in admin from managing their own account', () => {
    const actualAvailability = getAdminUserActionAvailability({
      targetUserId: 4,
      targetRole: 'admin',
      actorUserId: 4,
      adminTotal: 3,
    });
    expect(actualAvailability.canUpdate).toBe(false);
    expect(actualAvailability.canDelete).toBe(false);
    expect(actualAvailability.updateDisabledReason).toContain('own account');
  });

  it('blocks deleting or demoting the last remaining admin', () => {
    const actualAvailability = getAdminUserActionAvailability({
      targetUserId: 4,
      targetRole: 'admin',
      actorUserId: 9,
      adminTotal: 1,
    });
    expect(actualAvailability.canUpdate).toBe(true);
    expect(actualAvailability.canDelete).toBe(false);
    expect(actualAvailability.canLeaveAdminRole).toBe(false);
  });

  it('allows managing another non-admin user', () => {
    const actualAvailability = getAdminUserActionAvailability({
      targetUserId: 2,
      targetRole: 'reader',
      actorUserId: 9,
      adminTotal: 1,
    });
    expect(actualAvailability.canUpdate).toBe(true);
    expect(actualAvailability.canDelete).toBe(true);
    expect(actualAvailability.canLeaveAdminRole).toBe(true);
  });
});
