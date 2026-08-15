import { Module } from '@nestjs/common';

import { ReadingModule } from '@/modules/reading/reading.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { ReadingIntelligenceService } from './reading-intelligence.service';
import { ReadingVisualEngagementService } from './reading-visual-engagement.service';
import { ReadingVisualEngagementPrismaRepository } from './repository/reading-visual-engagement-prisma.repository';
import { ReadingVisualEngagementRepository } from './repository/reading-visual-engagement.repository';

@Module({
  imports: [DatabaseProviderModule, ReadingModule],
  providers: [
    ReadingIntelligenceService,
    ReadingVisualEngagementService,
    {
      provide: ReadingVisualEngagementRepository,
      useClass: ReadingVisualEngagementPrismaRepository,
    },
  ],
  exports: [ReadingIntelligenceService],
})
export class ReadingIntelligenceModule {}
