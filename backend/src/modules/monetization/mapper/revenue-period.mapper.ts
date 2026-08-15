import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodType } from '@/modules/monetization/types/revenue-period-details-schema.type';

export class RevenuePeriodMapper {
  static toEntity(schema: RevenuePeriodType): RevenuePeriodEntity {
    return new RevenuePeriodEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      startsAt: schema.startsAt,
      endsAt: schema.endsAt,
      status: schema.status as RevenuePeriodStatus,
      platformCutPercent: Number(schema.platformCutPercent),
      poolAmountCents: schema.poolAmountCents,
    });
  }
}
