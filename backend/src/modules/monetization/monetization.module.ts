import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { ReadingIntelligenceModule } from '@/modules/reading-intelligence/reading-intelligence.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { BookEngagementService } from './book-engagement.service';
import { BookEngagementPrismaRepository } from './repository/book-engagement-prisma.repository';
import { BookEngagementRepository } from './repository/book-engagement.repository';
import { RevenuePeriodPrismaRepository } from './repository/revenue-period-prisma.repository';
import { RevenuePeriodRepository } from './repository/revenue-period.repository';
import { RevenuePeriodService } from './revenue-period.service';

@Module({
  imports: [DatabaseProviderModule, BookModule, ReadingIntelligenceModule],
  providers: [
    RevenuePeriodService,
    BookEngagementService,
    { provide: RevenuePeriodRepository, useClass: RevenuePeriodPrismaRepository },
    { provide: BookEngagementRepository, useClass: BookEngagementPrismaRepository },
  ],
  exports: [RevenuePeriodService, BookEngagementService],
})
export class MonetizationModule {}
