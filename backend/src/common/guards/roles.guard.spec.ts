import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessDeniedException } from '@/common/exceptions/access-denied.exception';

import { RolesGuard } from './roles.guard';

function createContext(role: string): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 1, role } }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows the request when no roles are declared', () => {
    const mockReflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) };
    const rolesGuard = new RolesGuard(mockReflector as unknown as Reflector);
    expect(rolesGuard.canActivate(createContext('reader'))).toBe(true);
  });

  it('allows the request when the declared role list is empty', () => {
    const mockReflector = { getAllAndOverride: jest.fn().mockReturnValue([]) };
    const rolesGuard = new RolesGuard(mockReflector as unknown as Reflector);
    expect(rolesGuard.canActivate(createContext('reader'))).toBe(true);
  });

  it('allows the request when the principal has a required role', () => {
    const mockReflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) };
    const rolesGuard = new RolesGuard(mockReflector as unknown as Reflector);
    expect(rolesGuard.canActivate(createContext('admin'))).toBe(true);
  });

  it('throws AccessDeniedException when the principal lacks a required role', () => {
    const mockReflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) };
    const rolesGuard = new RolesGuard(mockReflector as unknown as Reflector);
    expect(() => rolesGuard.canActivate(createContext('reader'))).toThrow(AccessDeniedException);
  });
});
