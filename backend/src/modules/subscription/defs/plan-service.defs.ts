import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

export type CreatePlanServiceInput = {
  readonly slug: string;
  readonly name: string;
  readonly kind: PlanKind;
  readonly interval?: PlanInterval | null;
};

export type ListPlansServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
};
