import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('allows a public route without authenticating', async () => {
    const mockReflector = { getAllAndOverride: jest.fn().mockReturnValue(true) };
    const jwtAuthGuard = new JwtAuthGuard(mockReflector as unknown as Reflector);
    const context = {
      getHandler: () => undefined,
      getClass: () => undefined,
    } as unknown as ExecutionContext;
    const actualCanActivate: boolean = await jwtAuthGuard.canActivate(context);
    expect(actualCanActivate).toBe(true);
  });

  it('rethrows application exceptions from the strategy', () => {
    const jwtAuthGuard = new JwtAuthGuard({} as Reflector);
    expect(() =>
      jwtAuthGuard.handleRequest(new AuthenticationFailedException(), undefined),
    ).toThrow(AuthenticationFailedException);
  });

  it('throws AuthenticationFailedException when the principal is missing', () => {
    const jwtAuthGuard = new JwtAuthGuard({} as Reflector);
    expect(() => jwtAuthGuard.handleRequest(null, undefined)).toThrow(
      AuthenticationFailedException,
    );
  });

  it('returns the authenticated principal', () => {
    const jwtAuthGuard = new JwtAuthGuard({} as Reflector);
    const expectedUser = { id: 1, role: 'reader' };
    expect(jwtAuthGuard.handleRequest(null, expectedUser)).toBe(expectedUser);
  });
});
