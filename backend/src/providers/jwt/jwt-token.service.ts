import { Injectable } from '@nestjs/common';
import { JwtPayload, sign, SignOptions, TokenExpiredError, verify } from 'jsonwebtoken';

import { JwtConfigService } from '@/config/jwt/jwt-config.service';
import { JWT_ISSUER } from '@/providers/jwt/consts';
import { JwtCreateTokenInput, JwtVerifyTokenInput } from '@/providers/jwt/defs/jwt-token.defs';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtExpiredException } from '@/providers/jwt/exceptions/jwt-expired.exception';
import { JwtInvalidException } from '@/providers/jwt/exceptions/jwt-invalid.exception';

type JwtPurposeSettings = {
  readonly secret: string;
  readonly expiresIn: string;
};

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtConfigService: JwtConfigService) {}

  createToken<T extends object>(input: JwtCreateTokenInput<T>): string {
    const settings: JwtPurposeSettings = this.resolvePurposeSettings(input.purpose);
    const signOptions: SignOptions = this.buildSignOptions(settings.expiresIn, input.audience);
    return sign({ ...input.payload }, settings.secret, signOptions);
  }

  verifyToken<T extends object>(input: JwtVerifyTokenInput): T {
    const settings: JwtPurposeSettings = this.resolvePurposeSettings(input.purpose);
    try {
      const payload: string | JwtPayload = verify(input.token, settings.secret, {
        issuer: JWT_ISSUER,
        audience: input.audience,
      });
      return this.readObjectPayload<T>(payload);
    } catch (err: unknown) {
      this.throwVerificationException(err);
    }
  }

  private buildSignOptions(expiresIn: string, audience: string | undefined): SignOptions {
    const signOptions: SignOptions = {
      expiresIn: expiresIn as SignOptions['expiresIn'],
      issuer: JWT_ISSUER,
    };
    if (audience !== undefined) {
      signOptions.audience = audience;
    }
    return signOptions;
  }

  private readObjectPayload<T extends object>(payload: string | JwtPayload): T {
    if (typeof payload === 'string') {
      throw new JwtInvalidException();
    }
    return payload as T;
  }

  private throwVerificationException(err: unknown): never {
    if (err instanceof TokenExpiredError) {
      throw new JwtExpiredException();
    }
    if (err instanceof JwtExpiredException || err instanceof JwtInvalidException) {
      throw err;
    }
    throw new JwtInvalidException();
  }

  private resolvePurposeSettings(purpose: JwtTokenPurpose): JwtPurposeSettings {
    if (purpose === JwtTokenPurpose.ACCESS) {
      return {
        secret: this.jwtConfigService.accessSecret,
        expiresIn: this.jwtConfigService.accessExpiresIn,
      };
    }
    return {
      secret: this.jwtConfigService.recoverySecret,
      expiresIn: this.jwtConfigService.recoveryExpiresIn,
    };
  }
}
