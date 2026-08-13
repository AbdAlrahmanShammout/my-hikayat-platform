import { Global, Module } from '@nestjs/common';

import { PrismaProviderService } from './prisma-provider.service';

@Global()
@Module({
  providers: [PrismaProviderService],
  exports: [PrismaProviderService],
})
export class PrismaProviderModule {}
