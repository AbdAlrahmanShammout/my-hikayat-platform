import { Module } from '@nestjs/common';

import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { JwtProviderModule } from '@/providers/jwt/jwt-provider.module';
import { StorageProviderModule } from '@/providers/storage/storage-provider.module';

@Module({
  imports: [DatabaseProviderModule, JwtProviderModule, StorageProviderModule],
  exports: [DatabaseProviderModule, JwtProviderModule, StorageProviderModule],
})
export class ProviderModule {}
