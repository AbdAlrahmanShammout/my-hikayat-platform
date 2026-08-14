import { Module } from '@nestjs/common';

import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { JwtProviderModule } from '@/providers/jwt/jwt-provider.module';
import { EncryptionProviderModule } from '@/providers/encryption/encryption-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';

@Module({
  imports: [
    DatabaseProviderModule,
    JwtProviderModule,
    StorageProviderModule,
    EncryptionProviderModule,
  ],
  exports: [
    DatabaseProviderModule,
    JwtProviderModule,
    StorageProviderModule,
    EncryptionProviderModule,
  ],
})
export class ProviderModule {}
