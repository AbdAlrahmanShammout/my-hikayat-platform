import { Module } from '@nestjs/common';

import { ReadingModule } from '@/modules/reading/reading.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { ReadingChapterEngagementService } from './reading-chapter-engagement.service';
import { ReadingIntelligenceService } from './reading-intelligence.service';
import { ReadingVisualEngagementService } from './reading-visual-engagement.service';
import { ReadingChapterEngagementPrismaRepository } from './repository/reading-chapter-engagement-prisma.repository';
import { ReadingChapterEngagementRepository } from './repository/reading-chapter-engagement.repository';
import { ReadingVisualEngagementPrismaRepository } from './repository/reading-visual-engagement-prisma.repository';
import { ReadingVisualEngagementRepository } from './repository/reading-visual-engagement.repository';

@Module({
  imports: [DatabaseProviderModule, ReadingModule],
  providers: [
    ReadingIntelligenceService,
    ReadingVisualEngagementService,
    ReadingChapterEngagementService,
    {
      provide: ReadingVisualEngagementRepository,
      useClass: ReadingVisualEngagementPrismaRepository,
    },
    {
      provide: ReadingChapterEngagementRepository,
      useClass: ReadingChapterEngagementPrismaRepository,
    },
  ],
  exports: [ReadingIntelligenceService, ReadingChapterEngagementService],
})
export class ReadingIntelligenceModule {}
