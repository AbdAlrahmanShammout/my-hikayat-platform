import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

function parseTitle(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return value.trim().replace(/\s+/g, ' ');
}

export class UpdateCollectionRequestDto {
  @ApiPropertyOptional({
    description: 'Editorial collection title',
    example: 'Harbor Picks',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseTitle(value))
  title?: string;
}
