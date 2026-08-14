import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { Principal } from '@/common/auth/principal.interface';
import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';

export function getRequestFromContext(context: ExecutionContext): Request {
  return context.switchToHttp().getRequest<Request>();
}

export function getUserFromRequest(request: Request): Principal {
  const user: unknown = request.user;
  if (!isPrincipal(user)) {
    throw new AuthenticationFailedException();
  }
  return user;
}

export function getUserFromRequestUseContext(context: ExecutionContext): Principal {
  return getUserFromRequest(getRequestFromContext(context));
}

function isPrincipal(value: unknown): value is Principal {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('id' in value) || !('role' in value)) {
    return false;
  }
  return typeof value.id === 'number' && typeof value.role === 'string';
}
