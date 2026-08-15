import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';

export type CreateRevenuePeriodRepoInput = {
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly status: RevenuePeriodStatus;
  readonly platformCutPercent: number;
  readonly poolAmountCents: number | null;
};

export type UpdateRevenuePeriodRepoInput = {
  readonly id: number;
  readonly status?: RevenuePeriodStatus;
  readonly platformCutPercent?: number;
  readonly poolAmountCents?: number | null;
};

export type ListRevenuePeriodsRepoInput = {
  readonly limit: number;
  readonly offset: number;
};

export type RevenuePeriodPage = {
  readonly entities: RevenuePeriodEntity[];
  readonly total: number;
};
