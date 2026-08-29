import { BaseEntity } from '@/common/base/base.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanZodType } from '@/modules/subscription/zod/plan.zod';

export class PlanEntity extends BaseEntity {
  slug!: string;
  name!: string;
  description!: string;
  kind!: PlanKind;
  interval!: PlanInterval | null;
  stripePriceId!: string | null;
  amountCents!: number | null;
  currency!: string | null;

  constructor(data: PlanZodType) {
    super();
    Object.assign(this, data);
  }
}
