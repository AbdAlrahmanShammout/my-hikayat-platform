import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

export type CreatePlanRepoInput = {
  readonly slug: string;
  readonly name: string;
  readonly kind: PlanKind;
  readonly interval: PlanInterval | null;
};

export type ListPlansRepoInput = {
  readonly limit: number;
  readonly offset: number;
};

export type PlanPage = {
  readonly entities: PlanEntity[];
  readonly total: number;
};
