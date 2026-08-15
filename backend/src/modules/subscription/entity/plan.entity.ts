import { BaseEntity } from '@/common/base/base.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanZodType } from '@/modules/subscription/zod/plan.zod';

export class PlanEntity extends BaseEntity {
  slug!: string;
  name!: string;
  kind!: PlanKind;
  interval!: PlanInterval | null;

  constructor(data: PlanZodType) {
    super();
    Object.assign(this, data);
  }
}
