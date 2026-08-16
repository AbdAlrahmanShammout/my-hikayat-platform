import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateCategoryRequestDto {
  @ApiProperty({
    description: 'Configured weight applied to engagement when calculating author revenue',
    example: 1.25,
    minimum: 0,
    exclusiveMinimum: true,
  })
  @IsNumber()
  @IsPositive()
  categoryWeight!: number;
}
