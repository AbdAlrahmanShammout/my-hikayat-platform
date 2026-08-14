import { Module } from '@nestjs/common';

import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { JwtProviderModule } from '@/providers/jwt/jwt-provider.module';

@Module({
  imports: [DatabaseProviderModule, JwtProviderModule],
  exports: [DatabaseProviderModule, JwtProviderModule],
})
export class ProviderModule {}
