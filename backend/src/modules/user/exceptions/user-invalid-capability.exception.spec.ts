import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { UserRole } from '@/modules/user/enum/general.enum';

import { UserInvalidCapabilityException } from './user-invalid-capability.exception';

describe('UserInvalidCapabilityException', () => {
  it('reports a named invalid state', () => {
    const actualException = new UserInvalidCapabilityException(UserRole.AUTHOR, false);
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('USER_INVALID_CAPABILITY');
  });
});
