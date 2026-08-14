import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';

import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  it('rethrows application exceptions from the strategy', () => {
    const localAuthGuard = new LocalAuthGuard();
    expect(() =>
      localAuthGuard.handleRequest(new AuthenticationFailedException(), undefined),
    ).toThrow(AuthenticationFailedException);
  });

  it('throws AuthenticationFailedException when the principal is missing', () => {
    const localAuthGuard = new LocalAuthGuard();
    expect(() => localAuthGuard.handleRequest(null, undefined)).toThrow(
      AuthenticationFailedException,
    );
  });

  it('returns the authenticated principal', () => {
    const localAuthGuard = new LocalAuthGuard();
    const expectedUser = { id: 1, role: 'reader' };
    expect(localAuthGuard.handleRequest(null, expectedUser)).toBe(expectedUser);
  });
});
