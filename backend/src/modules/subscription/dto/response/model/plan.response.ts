import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';

export class PlanResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Stable plan slug', example: 'monthly' })
  slug: string;

  @ApiProperty({ description: 'Display name', example: 'Monthly' })
  name: string;

  @ApiProperty({
    description: 'Human-readable plan description',
    example: 'Monthly paid full-book reading',
  })
  description: string;

  @ApiProperty({ description: 'Plan kind', enum: PlanKind, example: PlanKind.MONTHLY_PAID })
  kind: PlanKind;

  @ApiProperty({
    description: 'Billing interval; null for the free plan',
    enum: PlanInterval,
    example: PlanInterval.MONTH,
    nullable: true,
  })
  interval: PlanInterval | null;

  @ApiPropertyOptional({
    description: 'Stripe price id; null for the free plan. Admin responses only.',
    example: 'price_seed_monthly',
    nullable: true,
  })
  stripePriceId?: string | null;

  @ApiProperty({
    description: 'Display amount in the smallest currency unit; null for free plans',
    example: 999,
    nullable: true,
  })
  amountCents: number | null;

  @ApiProperty({
    description: 'ISO currency code from Stripe; null for free plans',
    example: 'usd',
    nullable: true,
  })
  currency: string | null;

  constructor(entity: PlanEntity, options: { readonly includeStripePriceId?: boolean } = {}) {
    super(entity);
    this.slug = entity.slug;
    this.name = entity.name;
    this.description = entity.description;
    this.kind = entity.kind;
    this.interval = entity.interval;
    this.amountCents = entity.amountCents;
    this.currency = entity.currency;
    if (options.includeStripePriceId === true) {
      this.stripePriceId = entity.stripePriceId;
    }
  }
}
