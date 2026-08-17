import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { AdminInvitationInvalidException } from './admin-invitation-invalid.exception';

describe('AdminInvitationInvalidException', () => {
  it('rejects an unknown invitation token', () => {
    const actualException = new AdminInvitationInvalidException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('ADMIN_INVITATION_INVALID');
  });
});
