import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { UserSelfManagementException } from './user-self-management.exception';

describe('UserSelfManagementException', () => {
  it('reports a named invalid state', () => {
    const actualException = new UserSelfManagementException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('USER_SELF_MANAGEMENT');
  });
});
