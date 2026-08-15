import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';

export type UpsertBookEngagementRepoInput = {
  readonly revenuePeriodId: number;
  readonly bookId: number;
  readonly layoutType: BookLayoutType;
  readonly activeReadingMs: number;
  readonly activeSpreadMs: number;
  readonly visualSceneTimeMs: number;
  readonly categoryWeight: number;
  readonly weightedEngagement: number;
};

export type ReplaceBookEngagementsForPeriodRepoInput = {
  readonly revenuePeriodId: number;
  readonly rows: readonly UpsertBookEngagementRepoInput[];
};

export type ListBookEngagementsRepoInput = {
  readonly revenuePeriodId: number;
  readonly ownerId?: number;
  readonly limit: number;
  readonly offset: number;
};

export type BookEngagementPage = {
  readonly entities: BookEngagementEntity[];
  readonly total: number;
};

export type ListAllBookEngagementsRepoInput = {
  readonly revenuePeriodId: number;
};

export type SummarizeOwnerBookEngagementsRepoInput = {
  readonly revenuePeriodId: number;
  readonly ownerId: number;
};

export type OwnerBookEngagementSummary = {
  readonly totalActiveReadingMs: number;
  readonly totalActiveSpreadMs: number;
  readonly totalVisualSceneTimeMs: number;
  readonly totalWeightedEngagement: number;
};
