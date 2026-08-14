import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '@/common/decorators/route/public-route.decorator';
import { AppException } from '@/common/exceptions/app.exception';
import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';
import { getRequestFromContext } from '@/common/helpers/request/get-request.helper';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic: boolean =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) === true;
    if (isPublic) {
      return true;
    }
    return super.canActivate(context) as Promise<boolean>;
  }

  override getRequest(context: ExecutionContext): Request {
    return getRequestFromContext(context);
  }

  override handleRequest<TUser>(err: unknown, user: TUser): TUser {
    if (err instanceof AppException) {
      throw err;
    }
    if (err || !user) {
      throw new AuthenticationFailedException();
    }
    return user;
  }
}
