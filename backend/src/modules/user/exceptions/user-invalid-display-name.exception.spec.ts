import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { UserInvalidDisplayNameException } from './user-invalid-display-name.exception';

describe('UserInvalidDisplayNameException', () => {
  it('reports an empty display name', () => {
    const actualException = new UserInvalidDisplayNameException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('USER_INVALID_DISPLAY_NAME');
  });
});
