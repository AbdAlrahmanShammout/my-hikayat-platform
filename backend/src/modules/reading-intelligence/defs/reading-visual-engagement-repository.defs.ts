import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';

export type AddReadingVisualEngagementDurationsRepoInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly layoutType: BookLayoutType;
  readonly spreadIndex: number;
  readonly pageNumber: number;
  readonly activeDurationMs: number;
  readonly visualSceneTimeMs: number;
};

export type ListReadingVisualEngagementsRepoInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly sessionId: number;
  readonly limit: number;
  readonly offset: number;
};

export type ReadingVisualEngagementPage = {
  readonly entities: ReadingVisualEngagementEntity[];
  readonly total: number;
};
