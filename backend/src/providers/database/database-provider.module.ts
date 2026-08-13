import { Module } from '@nestjs/common';

import { PrismaProviderModule } from './prisma/prisma-provider.module';

@Module({
  imports: [PrismaProviderModule],
  exports: [PrismaProviderModule],
})
export class DatabaseProviderModule {}
