import type { ExecutionContext } from '@nestjs/common';

import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';

import {
  getRequestFromContext,
  getUserFromRequest,
  getUserFromRequestUseContext,
} from './get-request.helper';

describe('get-request helpers', () => {
  it('reads the HTTP request from the execution context', () => {
    const expectedRequest = { user: { id: 1, role: 'reader' } };
    const context = {
      switchToHttp: () => ({ getRequest: () => expectedRequest }),
    } as unknown as ExecutionContext;
    expect(getRequestFromContext(context)).toBe(expectedRequest);
  });

  it('returns the principal when the request carries one', () => {
    const actualPrincipal = getUserFromRequest({
      user: { id: 7, role: 'admin' },
    } as never);
    expect(actualPrincipal).toEqual({ id: 7, role: 'admin' });
  });

  it('throws when the request has no principal', () => {
    expect(() => getUserFromRequest({} as never)).toThrow(AuthenticationFailedException);
  });

  it('reads the principal through the execution context', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 3, role: 'author' } }),
      }),
    } as unknown as ExecutionContext;
    expect(getUserFromRequestUseContext(context)).toEqual({ id: 3, role: 'author' });
  });
});
