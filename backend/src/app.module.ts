import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { GlobalExceptionFilter } from '@/common/filter/global-exception.filter';
import { ValidationExceptionFilter } from '@/common/filter/validation-exception.filter';
import { createHttpThrottlerOptions } from '@/common/helpers/create-http-throttler-options.helper';
import { ConfigsModule } from '@/config/configs.module';
import { HealthModule } from '@/health/health.module';
import { FeatureBundleModule } from '@/modules/feature-bundle.module';
import { ProviderModule } from '@/providers/provider.module';

@Module({
  imports: [
    ConfigsModule,
    ProviderModule,
    FeatureBundleModule,
    HealthModule,
    ThrottlerModule.forRoot(createHttpThrottlerOptions()),
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
