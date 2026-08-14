import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { AccessDeniedException } from './access-denied.exception';

describe('AccessDeniedException', () => {
  it('reports an access denial without an HTTP status', () => {
    const actualException = new AccessDeniedException(
      'You do not have permission to perform this action',
    );
    expect(actualException.kind).toBe(ErrorKind.ACCESS_DENIED);
    expect(actualException.code).toBe('ACCESS_DENIED');
    expect(actualException.userFriendly).toBe(true);
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
