import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { AdminInvitationAlreadyAdminException } from './admin-invitation-already-admin.exception';

describe('AdminInvitationAlreadyAdminException', () => {
  it('rejects inviting an existing admin', () => {
    const actualException = new AdminInvitationAlreadyAdminException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('ADMIN_INVITATION_ALREADY_ADMIN');
  });
});
