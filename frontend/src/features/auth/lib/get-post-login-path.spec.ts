import { describe, expect, it } from 'vitest';

import { getPostLoginPath } from '@/features/auth/lib/get-post-login-path';
import { USER_ROLES } from '@/types/user-role';

describe('getPostLoginPath', () => {
  it('sends administrators to the admin dashboard', () => {
    expect(getPostLoginPath(USER_ROLES.ADMIN)).toBe('/admin');
  });

  it('sends authors to the author dashboard', () => {
    expect(getPostLoginPath(USER_ROLES.AUTHOR)).toBe('/author');
  });

  it('does not invent a home for readers', () => {
    expect(getPostLoginPath(USER_ROLES.READER)).toBeNull();
  });
});
