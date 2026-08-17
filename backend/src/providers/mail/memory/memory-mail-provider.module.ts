import { Module } from '@nestjs/common';

import { MailManagerService } from '@/providers/mail/mail-manager.service';
import { MemoryMailManagerService } from '@/providers/mail/memory/memory-mail-manager.service';

@Module({
  providers: [{ provide: MailManagerService, useClass: MemoryMailManagerService }],
  exports: [MailManagerService],
})
export class MemoryMailProviderModule {}
