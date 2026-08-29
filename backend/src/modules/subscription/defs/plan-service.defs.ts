import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

export type CreatePlanServiceInput = {
  readonly slug?: string;
  readonly name: string;
  readonly description: string;
  readonly kind: PlanKind;
  readonly stripePriceId?: string | null;
};

export type UpdatePlanServiceInput = {
  readonly id: number;
  readonly name?: string;
  readonly description?: string;
  readonly stripePriceId?: string | null;
};

export type ListPlansServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly kind?: PlanKind;
};

export type ResolveStripePriceFieldsResult = {
  readonly interval: PlanInterval;
  readonly amountCents: number;
  readonly currency: string;
};
