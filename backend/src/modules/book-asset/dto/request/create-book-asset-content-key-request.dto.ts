import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateBookAssetContentKeyRequestDto {
  @ApiProperty({
    description: 'Open reading session id owned by the authenticated reader for this book',
    example: 12,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionId!: number;
}
