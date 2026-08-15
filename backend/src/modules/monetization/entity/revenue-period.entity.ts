import { BaseEntity } from '@/common/base/base.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodZodType } from '@/modules/monetization/zod/revenue-period.zod';

export class RevenuePeriodEntity extends BaseEntity {
  startsAt!: Date;
  endsAt!: Date;
  status!: RevenuePeriodStatus;
  platformCutPercent!: number;
  poolAmountCents!: number | null;

  constructor(data: RevenuePeriodZodType) {
    super();
    Object.assign(this, data);
  }
}
