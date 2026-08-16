import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { ChapterDurationTotal } from '@/modules/reading-intelligence/defs/reading-chapter-engagement-repository.defs';
import { SpreadVisualDurationTotal } from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';

export type GetBookHeatmapServiceInput = {
  readonly book: BookEntity;
  readonly period: RevenuePeriodEntity;
};

export type BookHeatmapChapterCell = {
  readonly spineIndex: number;
  readonly title: string | null;
  readonly activeDurationMs: number;
};

export type BookHeatmap = {
  readonly bookId: number;
  readonly revenuePeriodId: number;
  readonly layoutType: BookLayoutType | null;
  readonly spreads: SpreadVisualDurationTotal[];
  readonly chapters: BookHeatmapChapterCell[];
};

export type MapChapterHeatmapCellsInput = {
  readonly chapterTotals: readonly ChapterDurationTotal[];
  readonly bookChapters: readonly { readonly spineIndex: number; readonly title: string }[];
};
