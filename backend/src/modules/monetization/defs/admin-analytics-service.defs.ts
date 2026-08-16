import { BookEngagementPage } from '@/modules/monetization/defs/book-engagement-repository.defs';
import { BookHeatmap } from '@/modules/monetization/defs/book-heatmap-service.defs';
import { BookRevenuePage } from '@/modules/monetization/defs/book-revenue-repository.defs';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';

export type ListAdminPeriodEarningsServiceInput = {
  readonly revenuePeriodId: number;
  readonly ownerId?: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type ListAdminPeriodAnalyticsServiceInput = {
  readonly revenuePeriodId: number;
  readonly ownerId?: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type GetAdminPeriodBookHeatmapServiceInput = {
  readonly revenuePeriodId: number;
  readonly bookId: number;
};

export type CalculateAdminPeriodRevenueServiceInput = {
  readonly revenuePeriodId: number;
  readonly actorUserId: number;
};

export type AggregateAdminPeriodEngagementServiceInput = {
  readonly revenuePeriodId: number;
};

export type AdminPeriodEarningsPage = {
  readonly period: RevenuePeriodEntity;
  readonly page: BookRevenuePage;
  readonly authorCents: number;
  readonly platformCutCents: number | null;
};

export type AdminPeriodAnalyticsPage = {
  readonly period: RevenuePeriodEntity;
  readonly page: BookEngagementPage;
  readonly totalActiveReadingMs: number;
  readonly totalActiveSpreadMs: number;
  readonly totalVisualSceneTimeMs: number;
  readonly totalWeightedEngagement: number;
  readonly totalReadingMinutes: number;
};

export type AdminPeriodBookHeatmap = BookHeatmap;
