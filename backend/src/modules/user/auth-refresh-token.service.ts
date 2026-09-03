import { Injectable } from '@nestjs/common';

import { parseJwtExpiresInToMilliseconds } from '@/common/helpers/parse-jwt-expires-in.helper';
import { JwtConfigService } from '@/config/jwt/jwt-config.service';
import { AuthRefreshTokenEntity } from '@/modules/user/entity/auth-refresh-token.entity';
import { RefreshTokenInvalidException } from '@/modules/user/exceptions/refresh-token-invalid.exception';
import {
  createAuthRefreshTokenJti,
  hashAuthRefreshTokenJti,
} from '@/modules/user/helpers/auth-refresh-token.helper';
import { AuthRefreshTokenRepository } from '@/modules/user/repository/auth-refresh-token.repository';
import { JwtRefreshTokenPayload } from '@/providers/jwt/types/jwt-refresh-token-payload.type';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';

export type IssuedRefreshToken = {
  readonly refreshToken: string;
  readonly expiresAt: Date;
};

@Injectable()
export class AuthRefreshTokenService {
  constructor(
    private readonly authRefreshTokenRepository: AuthRefreshTokenRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly jwtConfigService: JwtConfigService,
  ) {}

  async issueForUser(userId: number): Promise<IssuedRefreshToken> {
    const jti: string = createAuthRefreshTokenJti();
    const expiresAt: Date = new Date(
      Date.now() + parseJwtExpiresInToMilliseconds(this.jwtConfigService.refreshExpiresIn),
    );
    await this.authRefreshTokenRepository.create({
      userId,
      tokenHash: hashAuthRefreshTokenJti(jti),
      expiresAt,
    });
    const payload: JwtRefreshTokenPayload = {
      principalId: userId,
      jti,
    };
    return {
      refreshToken: this.jwtTokenService.createToken({
        payload,
        purpose: JwtTokenPurpose.REFRESH,
      }),
      expiresAt,
    };
  }

  async consumeAndRotate(refreshToken: string): Promise<{
    readonly userId: number;
    readonly refreshToken: string;
  }> {
    const stored: AuthRefreshTokenEntity = await this.requireUsableStoredToken(refreshToken);
    await this.authRefreshTokenRepository.revoke(stored.id, new Date());
    const issued: IssuedRefreshToken = await this.issueForUser(stored.userId);
    return {
      userId: stored.userId,
      refreshToken: issued.refreshToken,
    };
  }

  async revokePresentedToken(refreshToken: string): Promise<void> {
    try {
      const stored: AuthRefreshTokenEntity = await this.requireUsableStoredToken(refreshToken);
      await this.authRefreshTokenRepository.revoke(stored.id, new Date());
    } catch (err: unknown) {
      if (err instanceof RefreshTokenInvalidException) {
        return;
      }
      throw err;
    }
  }

  private async requireUsableStoredToken(refreshToken: string): Promise<AuthRefreshTokenEntity> {
    let payload: JwtRefreshTokenPayload;
    try {
      payload = this.jwtTokenService.verifyToken<JwtRefreshTokenPayload>({
        token: refreshToken,
        purpose: JwtTokenPurpose.REFRESH,
      });
    } catch {
      throw new RefreshTokenInvalidException();
    }
    if (
      !Number.isInteger(payload.principalId) ||
      payload.principalId <= 0 ||
      typeof payload.jti !== 'string' ||
      payload.jti.trim().length === 0
    ) {
      throw new RefreshTokenInvalidException();
    }
    const stored: AuthRefreshTokenEntity | null =
      await this.authRefreshTokenRepository.findByTokenHash(hashAuthRefreshTokenJti(payload.jti));
    if (stored === null || stored.revokedAt !== null) {
      throw new RefreshTokenInvalidException();
    }
    if (stored.userId !== payload.principalId) {
      throw new RefreshTokenInvalidException();
    }
    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new RefreshTokenInvalidException();
    }
    return stored;
  }
}
