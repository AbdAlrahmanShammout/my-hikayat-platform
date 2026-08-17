import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { AdminInvitationExpiredException } from './admin-invitation-expired.exception';

describe('AdminInvitationExpiredException', () => {
  it('rejects an expired invitation', () => {
    const actualException = new AdminInvitationExpiredException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('ADMIN_INVITATION_EXPIRED');
  });
});
