import { Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Principal } from '@/common/auth/principal.interface';
import { ROLES_KEY } from '@/common/decorators/route/roles.decorator';
import { AccessDeniedException } from '@/common/exceptions/access-denied.exception';
import { getUserFromRequestUseContext } from '@/common/helpers/request/get-request.helper';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: string[] | undefined = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredRoles === undefined || requiredRoles.length === 0) {
      return true;
    }
    const principal: Principal = getUserFromRequestUseContext(context);
    if (!requiredRoles.includes(principal.role)) {
      throw new AccessDeniedException('You do not have permission to perform this action');
    }
    return true;
  }
}
