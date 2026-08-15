import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';

export type UpsertBookRevenueRepoInput = {
  readonly revenuePeriodId: number;
  readonly bookId: number;
  readonly ownerId: number;
  readonly weightedEngagement: number;
  readonly poolShareCents: number;
  readonly platformCutCents: number;
  readonly authorCents: number;
};

export type ReplaceBookRevenuesForPeriodRepoInput = {
  readonly revenuePeriodId: number;
  readonly rows: readonly UpsertBookRevenueRepoInput[];
};

export type ListBookRevenuesRepoInput = {
  readonly revenuePeriodId: number;
  readonly ownerId?: number;
  readonly limit: number;
  readonly offset: number;
};

export type SumAuthorCentsRepoInput = {
  readonly revenuePeriodId: number;
  readonly ownerId?: number;
};

export type BookRevenuePage = {
  readonly entities: BookRevenueEntity[];
  readonly total: number;
};
