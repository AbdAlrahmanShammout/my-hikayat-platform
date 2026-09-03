import { Injectable } from '@nestjs/common';

import {
  PASSWORD_RESET_ACK_MESSAGE,
  PASSWORD_RESET_SUCCESS_MESSAGE,
} from '@/authentication/consts/password-reset.constant';
import { buildPasswordFingerprint } from '@/authentication/helpers/password-fingerprint.helper';
import { buildPasswordResetMail } from '@/authentication/helpers/password-reset-mail.helper';
import { JwtResetPasswordPayload } from '@/authentication/types/jwt-reset-password-payload.type';
import { hashString } from '@/common/helpers/hash-string.helper';
import { AppConfigService } from '@/config/app/app-config.service';
import { JwtConfigService } from '@/config/jwt/jwt-config.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';
import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';
import { JwtExpiredException } from '@/providers/jwt/exceptions/jwt-expired.exception';
import { JwtInvalidException } from '@/providers/jwt/exceptions/jwt-invalid.exception';
import { JwtTokenService } from '@/providers/jwt/jwt-token.service';
import { MailManagerService } from '@/providers/mail/mail-manager.service';

export type RequestPasswordResetInput = {
  readonly email: string;
};

export type ConfirmPasswordResetInput = {
  readonly token: string;
  readonly password: string;
};

@Injectable()
export class ForgetPasswordService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly jwtConfigService: JwtConfigService,
    private readonly mailManagerService: MailManagerService,
    private readonly appConfigService: AppConfigService,
  ) {}

  /**
   * Starts recovery. Always returns the same acknowledgement (enumeration-safe).
   */
  async requestPasswordReset(input: RequestPasswordResetInput): Promise<string> {
    const user: UserEntity | null = await this.userService.findUserByEmail(input.email);
    if (user === null) {
      return PASSWORD_RESET_ACK_MESSAGE;
    }
    const payload: JwtResetPasswordPayload = {
      principalId: user.id,
      passwordFingerprint: buildPasswordFingerprint(user.passwordHash),
    };
    const token: string = this.jwtTokenService.createToken({
      payload,
      purpose: JwtTokenPurpose.RECOVERY,
    });
    await this.mailManagerService.send(
      buildPasswordResetMail({
        email: user.email,
        token,
        publicOrigin: this.appConfigService.publicOrigin,
        expiresIn: this.jwtConfigService.recoveryExpiresIn,
      }),
    );
    return PASSWORD_RESET_ACK_MESSAGE;
  }

  /**
   * Confirms recovery with a RECOVERY-purpose JWT and updates the password hash.
   */
  async confirmPasswordReset(input: ConfirmPasswordResetInput): Promise<string> {
    const payload: JwtResetPasswordPayload = this.verifyRecoveryToken(input.token);
    const user: UserEntity = await this.userService.getUserById(payload.principalId);
    const expectedFingerprint: string = buildPasswordFingerprint(user.passwordHash);
    if (payload.passwordFingerprint !== expectedFingerprint) {
      throw new JwtInvalidException();
    }
    const passwordHash: string = await hashString(input.password);
    await this.userService.updatePasswordHash({
      userId: user.id,
      passwordHash,
    });
    return PASSWORD_RESET_SUCCESS_MESSAGE;
  }

  private verifyRecoveryToken(token: string): JwtResetPasswordPayload {
    try {
      const payload: JwtResetPasswordPayload = this.jwtTokenService.verifyToken({
        token,
        purpose: JwtTokenPurpose.RECOVERY,
      });
      if (
        typeof payload.principalId !== 'number' ||
        !Number.isFinite(payload.principalId) ||
        payload.principalId <= 0 ||
        typeof payload.passwordFingerprint !== 'string' ||
        payload.passwordFingerprint.length === 0
      ) {
        throw new JwtInvalidException();
      }
      return payload;
    } catch (err: unknown) {
      if (err instanceof JwtExpiredException || err instanceof JwtInvalidException) {
        throw err;
      }
      throw new JwtInvalidException();
    }
  }
}
