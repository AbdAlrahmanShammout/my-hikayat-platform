import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { MailManagerService } from '@/providers/mail/mail-manager.service';
import { SmtpMailManagerService } from '@/providers/mail/smtp/smtp-mail-manager.service';

import { MailProviderModule } from './mail-provider.module';

describe('MailProviderModule', () => {
  it('binds the abstract manager to the SMTP implementation', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, MailProviderModule],
    }).compile();
    const actualManager: MailManagerService = moduleRef.get(MailManagerService);
    expect(actualManager).toBeInstanceOf(SmtpMailManagerService);
    await moduleRef.close();
  });
});
