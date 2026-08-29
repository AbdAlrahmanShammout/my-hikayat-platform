import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class StartCheckoutRequestDto {
  @ApiProperty({
    description: 'Catalog plan id to purchase',
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  planId!: number;

  @ApiProperty({
    description: 'URL Stripe redirects to after a successful checkout',
    example: 'reader://billing/success',
  })
  @IsString()
  @IsNotEmpty()
  successUrl!: string;

  @ApiProperty({
    description: 'URL Stripe redirects to when checkout is canceled',
    example: 'reader://billing/cancel',
  })
  @IsString()
  @IsNotEmpty()
  cancelUrl!: string;
}
