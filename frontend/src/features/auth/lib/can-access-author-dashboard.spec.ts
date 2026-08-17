import { describe, expect, it } from 'vitest';

import { canAccessAuthorDashboard } from '@/features/auth/lib/can-access-author-dashboard';
import { USER_ROLES } from '@/types/user-role';

describe('canAccessAuthorDashboard', () => {
  it('allows authors and administrators', () => {
    expect(canAccessAuthorDashboard(USER_ROLES.AUTHOR)).toBe(true);
    expect(canAccessAuthorDashboard(USER_ROLES.ADMIN)).toBe(true);
  });

  it('does not allow readers', () => {
    expect(canAccessAuthorDashboard(USER_ROLES.READER)).toBe(false);
  });
});
