import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { PlanKind } from '@/modules/subscription/enum/general.enum';

export class CreatePlanRequestDto {
  @ApiProperty({ description: 'Display name', example: 'Monthly Plus' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Human-readable plan description',
    example: 'Full-book reading billed monthly',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Plan kind. Use monthly_paid for Stripe catalog plans.',
    enum: PlanKind,
    example: PlanKind.MONTHLY_PAID,
  })
  @IsEnum(PlanKind)
  kind!: PlanKind;

  @ApiPropertyOptional({
    description: 'Optional stable slug; derived from name when omitted',
    example: 'monthly-plus',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Stripe recurring price id; required for monthly_paid plans',
    example: 'price_123',
  })
  @IsOptional()
  @IsString()
  stripePriceId?: string;
}
