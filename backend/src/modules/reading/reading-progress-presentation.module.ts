import { Module } from '@nestjs/common';

import { BookProcessingModule } from '@/modules/book-processing/book-processing.module';
import { ReadingProgressPresentationService } from '@/modules/reading/reading-progress-presentation.service';

@Module({
  imports: [BookProcessingModule],
  providers: [ReadingProgressPresentationService],
  exports: [ReadingProgressPresentationService],
})
export class ReadingProgressPresentationModule {}
