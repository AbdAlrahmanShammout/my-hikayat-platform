import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { JwtExpiredException } from './jwt-expired.exception';

describe('JwtExpiredException', () => {
  it('reports expiry as an unauthenticated failure without an HTTP status', () => {
    const actualException = new JwtExpiredException();
    expect(actualException.kind).toBe(ErrorKind.UNAUTHENTICATED);
    expect(actualException.code).toBe('JWT_EXPIRED');
    expect(actualException.userFriendly).toBe(true);
    expect(actualException.message).toBe('Token has expired');
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
