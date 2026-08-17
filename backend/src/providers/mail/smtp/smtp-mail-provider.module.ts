import { Module } from '@nestjs/common';

import { MailConfigService } from '@/config/mail/mail-config.service';
import { MAIL_TRANSPORTER } from '@/providers/mail/consts';
import { MailManagerService } from '@/providers/mail/mail-manager.service';
import { createSmtpTransport } from '@/providers/mail/smtp/smtp-mail-client.factory';
import { SmtpMailManagerService } from '@/providers/mail/smtp/smtp-mail-manager.service';

@Module({
  providers: [
    {
      provide: MAIL_TRANSPORTER,
      useFactory: createSmtpTransport,
      inject: [MailConfigService],
    },
    { provide: MailManagerService, useClass: SmtpMailManagerService },
  ],
  exports: [MailManagerService],
})
export class SmtpMailProviderModule {}
