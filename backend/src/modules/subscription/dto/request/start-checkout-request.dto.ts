import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartCheckoutRequestDto {
  @ApiProperty({
    description: 'URL Stripe redirects to after a successful checkout',
    example: 'http://localhost:3000/billing/success',
  })
  @IsString()
  @IsNotEmpty()
  successUrl!: string;

  @ApiProperty({
    description: 'URL Stripe redirects to when checkout is canceled',
    example: 'http://localhost:3000/billing/cancel',
  })
  @IsString()
  @IsNotEmpty()
  cancelUrl!: string;
}
