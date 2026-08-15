import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

function parseOptionalDateQuery(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  return new Date(value);
}

export class ListReadingSyncRequestDto {
  @ApiPropertyOptional({
    description: 'Only include rows updated at or after this timestamp',
    example: '2026-08-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }: { value: unknown }) => parseOptionalDateQuery(value))
  updatedSince?: Date;
}
