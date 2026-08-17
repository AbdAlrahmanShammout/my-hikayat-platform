import { Module } from '@nestjs/common';

import { SmtpMailProviderModule } from '@/providers/mail/smtp/smtp-mail-provider.module';

@Module({
  imports: [SmtpMailProviderModule],
  exports: [SmtpMailProviderModule],
})
export class MailProviderModule {}
