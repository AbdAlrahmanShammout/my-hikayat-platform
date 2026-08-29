import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePlanRequestDto {
  @ApiPropertyOptional({ description: 'Display name', example: 'Monthly Plus' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Human-readable plan description',
    example: 'Full-book reading billed monthly',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Stripe recurring price id for paid plans',
    example: 'price_123',
  })
  @IsOptional()
  @IsString()
  stripePriceId?: string;
}
