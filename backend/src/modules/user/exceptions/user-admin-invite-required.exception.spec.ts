import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { UserAdminInviteRequiredException } from './user-admin-invite-required.exception';

describe('UserAdminInviteRequiredException', () => {
  it('rejects granting admin without an invitation', () => {
    const actualException = new UserAdminInviteRequiredException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('USER_ADMIN_INVITE_REQUIRED');
  });
});
