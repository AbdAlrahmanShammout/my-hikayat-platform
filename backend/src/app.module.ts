import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { GlobalExceptionFilter } from '@/common/filter/global-exception.filter';
import { ValidationExceptionFilter } from '@/common/filter/validation-exception.filter';
import { ConfigsModule } from '@/config/configs.module';
import { HealthModule } from '@/health/health.module';

@Module({
  imports: [ConfigsModule, HealthModule],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
  ],
})
export class AppModule {}
