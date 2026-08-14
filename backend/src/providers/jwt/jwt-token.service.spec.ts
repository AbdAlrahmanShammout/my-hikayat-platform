import { Test, TestingModule } from '@nestjs/testing';
import { sign } from 'jsonwebtoken';

import { JwtConfigService } from '@/config/jwt/jwt-config.service';
import { JWT_ISSUER } from '@/providers/jwt/consts';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtExpiredException } from '@/providers/jwt/exceptions/jwt-expired.exception';
import { JwtInvalidException } from '@/providers/jwt/exceptions/jwt-invalid.exception';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';

type TokenPayload = {
  readonly principalId: number;
};

describe('JwtTokenService', () => {
  const mockJwtConfigService = {
    accessSecret: 'test-jwt-access-secret-not-for-production',
    accessExpiresIn: '15m',
    recoverySecret: 'test-jwt-recovery-secret-not-for-production',
    recoveryExpiresIn: '1h',
  };
  let jwtTokenService: JwtTokenService;

  beforeEach(async () => {
    mockJwtConfigService.accessExpiresIn = '15m';
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [JwtTokenService, { provide: JwtConfigService, useValue: mockJwtConfigService }],
    }).compile();
    jwtTokenService = moduleRef.get(JwtTokenService);
  });

  describe('createToken', () => {
    it('signs a payload that verifyToken can read for the same purpose', () => {
      const expectedPayload: TokenPayload = { principalId: 42 };
      const actualToken: string = jwtTokenService.createToken({
        payload: expectedPayload,
        purpose: JwtTokenPurpose.ACCESS,
      });
      const actualPayload: TokenPayload = jwtTokenService.verifyToken<TokenPayload>({
        token: actualToken,
        purpose: JwtTokenPurpose.ACCESS,
      });
      expect(actualPayload.principalId).toBe(expectedPayload.principalId);
    });

    it('embeds the application issuer on the signed token', () => {
      const actualToken: string = jwtTokenService.createToken({
        payload: { principalId: 1 },
        purpose: JwtTokenPurpose.ACCESS,
      });
      const actualPayload: TokenPayload & { iss?: string } = jwtTokenService.verifyToken<
        TokenPayload & { iss?: string }
      >({
        token: actualToken,
        purpose: JwtTokenPurpose.ACCESS,
      });
      expect(actualPayload.iss).toBe(JWT_ISSUER);
    });
  });

  describe('verifyToken', () => {
    it('rejects an access token verified with the recovery secret', () => {
      const actualToken: string = jwtTokenService.createToken({
        payload: { principalId: 7 },
        purpose: JwtTokenPurpose.ACCESS,
      });
      expect(() =>
        jwtTokenService.verifyToken({
          token: actualToken,
          purpose: JwtTokenPurpose.RECOVERY,
        }),
      ).toThrow(JwtInvalidException);
    });

    it('rejects a token signed for a different audience', () => {
      const actualToken: string = jwtTokenService.createToken({
        payload: { principalId: 7 },
        purpose: JwtTokenPurpose.ACCESS,
        audience: 'reader',
      });
      expect(() =>
        jwtTokenService.verifyToken({
          token: actualToken,
          purpose: JwtTokenPurpose.ACCESS,
          audience: 'admin',
        }),
      ).toThrow(JwtInvalidException);
    });

    it('accepts a token when the audience matches', () => {
      const actualToken: string = jwtTokenService.createToken({
        payload: { principalId: 7 },
        purpose: JwtTokenPurpose.ACCESS,
        audience: 'reader',
      });
      const actualPayload: TokenPayload = jwtTokenService.verifyToken<TokenPayload>({
        token: actualToken,
        purpose: JwtTokenPurpose.ACCESS,
        audience: 'reader',
      });
      expect(actualPayload.principalId).toBe(7);
    });

    it('throws JwtExpiredException when the token lifetime has elapsed', () => {
      const expiredAt: number = Math.floor(Date.now() / 1000) - 10;
      const expiredToken: string = sign(
        { principalId: 9, exp: expiredAt },
        mockJwtConfigService.accessSecret,
        { issuer: JWT_ISSUER },
      );
      expect(() =>
        jwtTokenService.verifyToken({
          token: expiredToken,
          purpose: JwtTokenPurpose.ACCESS,
        }),
      ).toThrow(JwtExpiredException);
    });

    it('throws JwtInvalidException for a malformed token', () => {
      expect(() =>
        jwtTokenService.verifyToken({
          token: 'not-a-jwt',
          purpose: JwtTokenPurpose.ACCESS,
        }),
      ).toThrow(JwtInvalidException);
    });
  });
});
