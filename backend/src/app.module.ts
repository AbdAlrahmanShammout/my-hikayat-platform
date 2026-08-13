import { Module } from '@nestjs/common';

import { ConfigsModule } from '@/config/configs.module';
import { HealthModule } from '@/health/health.module';

@Module({
  imports: [ConfigsModule, HealthModule],
})
export class AppModule {}
