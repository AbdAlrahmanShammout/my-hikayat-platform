import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingChapterEngagementEntity } from '@/modules/reading-intelligence/entity/reading-chapter-engagement.entity';

export type AddReadingChapterEngagementDurationsRepoInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly layoutType: BookLayoutType;
  readonly spineIndex: number;
  readonly activeDurationMs: number;
};

export type ListReadingChapterEngagementsRepoInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly limit: number;
  readonly offset: number;
};

export type ReadingChapterEngagementPage = {
  readonly entities: ReadingChapterEngagementEntity[];
  readonly total: number;
};

export type SumReadingChapterEngagementDurationsRepoInput = {
  readonly startsAt: Date;
  readonly endsAt: Date;
};

export type BookChapterDurationTotal = {
  readonly bookId: number;
  readonly activeDurationMs: number;
};

export type SumChapterEngagementRepoInput = {
  readonly bookId: number;
  readonly startsAt: Date;
  readonly endsAt: Date;
};

export type ChapterDurationTotal = {
  readonly spineIndex: number;
  readonly activeDurationMs: number;
};
