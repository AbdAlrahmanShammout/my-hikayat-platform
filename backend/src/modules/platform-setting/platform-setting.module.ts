import { Module } from '@nestjs/common';

import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { PlatformSettingService } from './platform-setting.service';
import { PlatformSettingPrismaRepository } from './repository/platform-setting-prisma.repository';
import { PlatformSettingRepository } from './repository/platform-setting.repository';

@Module({
  imports: [DatabaseProviderModule],
  providers: [
    PlatformSettingService,
    { provide: PlatformSettingRepository, useClass: PlatformSettingPrismaRepository },
  ],
  exports: [PlatformSettingService],
})
export class PlatformSettingModule {}
