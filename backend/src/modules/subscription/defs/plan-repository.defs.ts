import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

export type CreatePlanRepoInput = {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly kind: PlanKind;
  readonly interval: PlanInterval | null;
  readonly stripePriceId: string | null;
  readonly amountCents: number | null;
  readonly currency: string | null;
};

export type UpdatePlanRepoInput = {
  readonly id: number;
  readonly name?: string;
  readonly description?: string;
  readonly interval?: PlanInterval | null;
  readonly stripePriceId?: string | null;
  readonly amountCents?: number | null;
  readonly currency?: string | null;
};

export type ListPlansRepoInput = {
  readonly limit: number;
  readonly offset: number;
  readonly kind?: PlanKind;
};

export type PlanPage = {
  readonly entities: PlanEntity[];
  readonly total: number;
};
