import { Injectable } from '@nestjs/common';

import {
  AcceptAdminInvitationAuthInput,
  AuthSession,
  LoginUserServiceInput,
  RegisterUserServiceInput,
} from '@/authentication/defs/auth-service.defs';
import { JwtAuthTokenPayload } from '@/authentication/types/jwt-auth-token-payload.type';
import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';
import { compareHashString } from '@/common/helpers/compare-hash-string.helper';
import { hashString } from '@/common/helpers/hash-string.helper';
import { JwtConfigService } from '@/config/jwt/jwt-config.service';
import { AdminInvitationService } from '@/modules/user/admin-invitation.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly adminInvitationService: AdminInvitationService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly jwtConfigService: JwtConfigService,
  ) {}

  async register(input: RegisterUserServiceInput): Promise<AuthSession> {
    const passwordHash: string = await hashString(input.password);
    const user: UserEntity = await this.userService.createUser({
      email: input.email,
      passwordHash,
    });
    return this.createSession(user);
  }

  async login(input: LoginUserServiceInput): Promise<AuthSession> {
    const user: UserEntity = await this.verifyCredentials(input);
    return this.createSession(user);
  }

  async acceptAdminInvitation(input: AcceptAdminInvitationAuthInput): Promise<AuthSession> {
    const passwordHash: string = await hashString(input.password);
    const user: UserEntity = await this.adminInvitationService.acceptInvitation({
      token: input.token,
      passwordHash,
    });
    return this.createSession(user);
  }

  async verifyCredentials(input: LoginUserServiceInput): Promise<UserEntity> {
    const user: UserEntity | null = await this.userService.findUserByEmail(input.email);
    if (user === null) {
      throw new AuthenticationFailedException();
    }
    const isPasswordValid: boolean = await compareHashString(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationFailedException();
    }
    return user;
  }

  createSession(user: UserEntity): AuthSession {
    const payload: JwtAuthTokenPayload = {
      principalId: user.id,
      role: user.role,
    };
    return {
      user,
      accessToken: this.jwtTokenService.createToken({
        payload,
        purpose: JwtTokenPurpose.ACCESS,
      }),
      expiresIn: this.jwtConfigService.accessExpiresIn,
    };
  }
}
