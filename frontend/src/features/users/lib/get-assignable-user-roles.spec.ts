import { describe, expect, it } from 'vitest';

import { getAssignableUserRoles } from '@/features/users/lib/get-assignable-user-roles';

describe('getAssignableUserRoles', () => {
  it('does not offer granting admin to a non-admin', () => {
    expect(getAssignableUserRoles('reader')).toEqual(['reader', 'author']);
    expect(getAssignableUserRoles('author')).toEqual(['reader', 'author']);
  });

  it('keeps admin available so an existing admin can be demoted', () => {
    expect(getAssignableUserRoles('admin')).toEqual(['reader', 'author', 'admin']);
  });
});
