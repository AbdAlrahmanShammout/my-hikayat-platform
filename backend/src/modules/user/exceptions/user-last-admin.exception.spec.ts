import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { UserLastAdminException } from './user-last-admin.exception';

describe('UserLastAdminException', () => {
  it('reports a named invalid state', () => {
    const actualException = new UserLastAdminException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('USER_LAST_ADMIN');
  });
});
