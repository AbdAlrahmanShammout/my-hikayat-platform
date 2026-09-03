import {
  PASSWORD_RESET_APPLICATION_NAME,
  PASSWORD_RESET_DEEP_LINK_PATH,
} from '@/authentication/consts/password-reset.constant';
import { SendMailInput } from '@/providers/mail/defs/mail-manager.defs';

export type BuildPasswordResetMailInput = {
  readonly email: string;
  readonly token: string;
  readonly publicOrigin: string;
  readonly expiresIn: string;
};

/**
 * Builds the password-reset email body with a deep link and a pasteable token.
 */
export function buildPasswordResetMail(input: BuildPasswordResetMailInput): SendMailInput {
  const deepLink: string = buildPasswordResetDeepLink(input.token);
  const webHintOrigin: string = input.publicOrigin.replace(/\/+$/, '');
  return {
    to: input.email,
    subject: `Reset your ${PASSWORD_RESET_APPLICATION_NAME} password`,
    text: [
      `We received a request to reset the password for your ${PASSWORD_RESET_APPLICATION_NAME} account.`,
      '',
      'Open this link on your device to choose a new password:',
      deepLink,
      '',
      'If the link does not open, paste this reset token into the app:',
      input.token,
      '',
      `This link expires in ${input.expiresIn}. If you did not ask for a reset, you can ignore this email.`,
      '',
      `Support origin reference: ${webHintOrigin}`,
    ].join('\n'),
  };
}

export function buildPasswordResetDeepLink(token: string): string {
  return `reader://${PASSWORD_RESET_DEEP_LINK_PATH}?token=${encodeURIComponent(token)}`;
}
