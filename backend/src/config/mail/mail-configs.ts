import { registerAs } from '@nestjs/config';

import { MAIL_SMTP_PORT_DEFAULT, MAIL_SMTP_SECURE_DEFAULT } from './mail-config.schema';

function readOptionalCredential(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }
  const normalizedCredential: string = value.trim();
  if (normalizedCredential.length === 0) {
    return null;
  }
  return normalizedCredential;
}

export default [
  registerAs('mail', () => ({
    from: process.env.MAIL_FROM,
    smtpHost: process.env.MAIL_SMTP_HOST,
    smtpPort: Number(process.env.MAIL_SMTP_PORT ?? MAIL_SMTP_PORT_DEFAULT),
    smtpSecure: (process.env.MAIL_SMTP_SECURE ?? String(MAIL_SMTP_SECURE_DEFAULT)) === 'true',
    smtpUser: readOptionalCredential(process.env.MAIL_SMTP_USER),
    smtpPassword: readOptionalCredential(process.env.MAIL_SMTP_PASSWORD),
  })),
];
