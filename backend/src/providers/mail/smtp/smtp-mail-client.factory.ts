import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { MailConfigService } from '@/config/mail/mail-config.service';

export function createSmtpTransport(mailConfigService: MailConfigService): Transporter {
  const user: string | null = mailConfigService.smtpUser;
  const password: string | null = mailConfigService.smtpPassword;
  return nodemailer.createTransport({
    host: mailConfigService.smtpHost,
    port: mailConfigService.smtpPort,
    secure: mailConfigService.smtpSecure,
    auth:
      user === null || password === null
        ? undefined
        : {
            user,
            pass: password,
          },
  });
}
