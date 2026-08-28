import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckoutReturnRequestDto {
  @ApiProperty({
    description: 'Allowlisted URL Stripe should return the reader to',
    example: 'reader://billing/success',
  })
  @IsString()
  @IsNotEmpty()
  to!: string;
}
