import { Module } from '@nestjs/common';

import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { RevenuePeriodPrismaRepository } from './repository/revenue-period-prisma.repository';
import { RevenuePeriodRepository } from './repository/revenue-period.repository';
import { RevenuePeriodService } from './revenue-period.service';

@Module({
  imports: [DatabaseProviderModule],
  providers: [
    RevenuePeriodService,
    { provide: RevenuePeriodRepository, useClass: RevenuePeriodPrismaRepository },
  ],
  exports: [RevenuePeriodService],
})
export class MonetizationModule {}
