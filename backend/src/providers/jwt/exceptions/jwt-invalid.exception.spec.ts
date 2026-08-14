import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { JwtInvalidException } from './jwt-invalid.exception';

describe('JwtInvalidException', () => {
  it('reports invalidity as an unauthenticated failure without an HTTP status', () => {
    const actualException = new JwtInvalidException();
    expect(actualException.kind).toBe(ErrorKind.UNAUTHENTICATED);
    expect(actualException.code).toBe('JWT_INVALID');
    expect(actualException.userFriendly).toBe(true);
    expect(actualException.message).toBe('Token is invalid');
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
