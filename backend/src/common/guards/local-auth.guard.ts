import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AppException } from '@/common/exceptions/app.exception';
import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
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
