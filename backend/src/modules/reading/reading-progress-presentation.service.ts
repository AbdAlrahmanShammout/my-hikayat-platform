import { Injectable } from '@nestjs/common';

import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { ReadingProgressPresentation } from '@/modules/reading/defs/reading-progress-presentation.defs';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { resolveReadingProgressPresentation } from '@/modules/reading/resolve-reading-progress-presentation.helper';

@Injectable()
export class ReadingProgressPresentationService {
  constructor(private readonly bookProcessingService: BookProcessingService) {}

  async buildReadingProgressPresentation(
    progress: ReadingProgressEntity,
  ): Promise<ReadingProgressPresentation> {
    const [chapters, pages, spreads] = await Promise.all([
      this.bookProcessingService.listChaptersByBookIds([progress.bookId]),
      this.bookProcessingService.listPagesByBookIds([progress.bookId]),
      this.bookProcessingService.listSpreadsByBookIds([progress.bookId]),
    ]);
    return resolveReadingProgressPresentation({
      progress,
      chapters,
      pages,
      spreads,
    });
  }
}
