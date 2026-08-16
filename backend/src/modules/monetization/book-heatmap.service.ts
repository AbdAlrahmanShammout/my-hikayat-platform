import { Injectable } from '@nestjs/common';

import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import {
  BookHeatmap,
  GetBookHeatmapServiceInput,
} from '@/modules/monetization/defs/book-heatmap-service.defs';
import { mapChapterHeatmapCells } from '@/modules/monetization/map-chapter-heatmap-cells.helper';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';

@Injectable()
export class BookHeatmapService {
  constructor(
    private readonly readingIntelligenceService: ReadingIntelligenceService,
    private readonly bookProcessingService: BookProcessingService,
  ) {}

  async getBookHeatmap(input: GetBookHeatmapServiceInput): Promise<BookHeatmap> {
    const range = {
      bookId: input.book.id,
      startsAt: input.period.startsAt,
      endsAt: input.period.endsAt,
    };
    if (input.book.layoutType === BookLayoutType.FIXED_LAYOUT) {
      const spreads =
        await this.readingIntelligenceService.listSpreadEngagementTotalsForBook(range);
      return {
        bookId: input.book.id,
        revenuePeriodId: input.period.id,
        layoutType: input.book.layoutType,
        spreads,
        chapters: [],
      };
    }
    if (input.book.layoutType === BookLayoutType.REFLOWABLE) {
      const [chapterTotals, bookChapters] = await Promise.all([
        this.readingIntelligenceService.listChapterEngagementTotalsForBook(range),
        this.bookProcessingService.listBookChapters(input.book.id),
      ]);
      return {
        bookId: input.book.id,
        revenuePeriodId: input.period.id,
        layoutType: input.book.layoutType,
        spreads: [],
        chapters: mapChapterHeatmapCells({ chapterTotals, bookChapters }),
      };
    }
    return {
      bookId: input.book.id,
      revenuePeriodId: input.period.id,
      layoutType: input.book.layoutType,
      spreads: [],
      chapters: [],
    };
  }
}
