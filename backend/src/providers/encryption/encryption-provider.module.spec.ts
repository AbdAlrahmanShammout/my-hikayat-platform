import { Test, TestingModule } from '@nestjs/testing';

import { ConfigsModule } from '@/config/configs.module';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';

import { EncryptionProviderModule } from './encryption-provider.module';

describe('EncryptionProviderModule', () => {
  it('exports the encryption manager when configuration is loaded', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigsModule, EncryptionProviderModule],
    }).compile();
    expect(moduleRef.get(EncryptionManagerService)).toBeDefined();
    await moduleRef.close();
  });
});
