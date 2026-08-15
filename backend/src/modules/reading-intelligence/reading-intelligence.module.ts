import { Module } from '@nestjs/common';

import { ReadingModule } from '@/modules/reading/reading.module';

import { ReadingIntelligenceService } from './reading-intelligence.service';

@Module({
  imports: [ReadingModule],
  providers: [ReadingIntelligenceService],
  exports: [ReadingIntelligenceService],
})
export class ReadingIntelligenceModule {}
