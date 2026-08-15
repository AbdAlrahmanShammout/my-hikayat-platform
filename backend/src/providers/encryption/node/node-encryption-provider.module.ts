import { Module } from '@nestjs/common';

import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';
import { NodeEncryptionManagerService } from '@/providers/encryption/node/node-encryption-manager.service';

@Module({
  providers: [{ provide: EncryptionManagerService, useClass: NodeEncryptionManagerService }],
  exports: [EncryptionManagerService],
})
export class NodeEncryptionProviderModule {}
