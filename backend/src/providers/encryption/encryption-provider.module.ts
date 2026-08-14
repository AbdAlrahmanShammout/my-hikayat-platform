import { Module } from '@nestjs/common';

import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';

@Module({
  providers: [EncryptionManagerService],
  exports: [EncryptionManagerService],
})
export class EncryptionProviderModule {}
