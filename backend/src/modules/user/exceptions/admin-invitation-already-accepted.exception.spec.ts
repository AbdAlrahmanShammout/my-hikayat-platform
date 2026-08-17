import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { AdminInvitationAlreadyAcceptedException } from './admin-invitation-already-accepted.exception';

describe('AdminInvitationAlreadyAcceptedException', () => {
  it('rejects a used invitation', () => {
    const actualException = new AdminInvitationAlreadyAcceptedException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('ADMIN_INVITATION_ALREADY_ACCEPTED');
  });
});
