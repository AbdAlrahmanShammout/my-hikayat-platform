import { Module } from '@nestjs/common';

import { NodeEncryptionProviderModule } from '@/providers/encryption/node/node-encryption-provider.module';

@Module({
  imports: [NodeEncryptionProviderModule],
  exports: [NodeEncryptionProviderModule],
})
export class EncryptionProviderModule {}
