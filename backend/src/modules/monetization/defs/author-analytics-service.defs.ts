import { BookEngagementPage } from '@/modules/monetization/defs/book-engagement-repository.defs';
import { BookHeatmap } from '@/modules/monetization/defs/book-heatmap-service.defs';
import { BookRevenuePage } from '@/modules/monetization/defs/book-revenue-repository.defs';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';

export type ListAuthorEarningsServiceInput = {
  readonly ownerId: number;
  readonly revenuePeriodId: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type ListAuthorEarningsTrendServiceInput = {
  readonly ownerId: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type ListAuthorAnalyticsServiceInput = {
  readonly ownerId: number;
  readonly revenuePeriodId: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type GetAuthorBookHeatmapServiceInput = {
  readonly ownerId: number;
  readonly bookId: number;
  readonly revenuePeriodId: number;
};

export type AuthorEarningsPage = {
  readonly page: BookRevenuePage;
  readonly authorCents: number;
};

export type AuthorEarningsTrendPoint = {
  readonly period: RevenuePeriodEntity;
  readonly authorCents: number;
};

export type AuthorEarningsTrendPage = {
  readonly entities: AuthorEarningsTrendPoint[];
  readonly total: number;
};

export type AuthorAnalyticsPage = {
  readonly page: BookEngagementPage;
  readonly totalActiveReadingMs: number;
  readonly totalActiveSpreadMs: number;
  readonly totalVisualSceneTimeMs: number;
  readonly totalWeightedEngagement: number;
  readonly totalReadingMinutes: number;
};

export type AuthorBookHeatmap = BookHeatmap;
