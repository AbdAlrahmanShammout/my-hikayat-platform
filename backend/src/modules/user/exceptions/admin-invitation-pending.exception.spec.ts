import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { AdminInvitationPendingException } from './admin-invitation-pending.exception';

describe('AdminInvitationPendingException', () => {
  it('rejects a duplicate pending invitation', () => {
    const actualException = new AdminInvitationPendingException('admin@example.com');
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('ADMIN_INVITATION_PENDING');
  });
});
