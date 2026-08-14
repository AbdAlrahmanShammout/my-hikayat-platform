import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

import { JwtAuthTokenPayload } from '@/authentication/types/jwt-auth-token-payload.type';
import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async validate(token: string): Promise<UserEntity> {
    const payload: JwtAuthTokenPayload = this.jwtTokenService.verifyToken<JwtAuthTokenPayload>({
      token,
      purpose: JwtTokenPurpose.ACCESS,
    });
    const user: UserEntity | null = await this.userService.findUserById(payload.principalId);
    if (user === null || user.id !== payload.principalId) {
      throw new AuthenticationFailedException();
    }
    return user;
  }
}
