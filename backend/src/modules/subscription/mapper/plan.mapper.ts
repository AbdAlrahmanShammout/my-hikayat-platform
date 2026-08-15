import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanType } from '@/modules/subscription/types/plan-details-schema.type';

export class PlanMapper {
  static toEntity(schema: PlanType): PlanEntity {
    return new PlanEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      slug: schema.slug,
      name: schema.name,
      kind: schema.kind as PlanKind,
      interval: (schema.interval as PlanInterval | null) ?? null,
    });
  }
}
