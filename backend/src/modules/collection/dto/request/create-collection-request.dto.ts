import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

function parseOptionalIdArray(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (!Array.isArray(value)) {
    return value;
  }
  const items: unknown[] = value as unknown[];
  return items.map((item: unknown) => {
    if (typeof item === 'number' && Number.isFinite(item)) {
      return item;
    }
    if (typeof item === 'string' && item !== '') {
      const parsed: number = Number.parseInt(item, 10);
      return Number.isFinite(parsed) ? parsed : item;
    }
    return item;
  });
}

function parseTitle(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return value.trim().replace(/\s+/g, ' ');
}

export class CreateCollectionRequestDto {
  @ApiProperty({
    description: 'Editorial collection title',
    example: 'Harbor Picks',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseTitle(value))
  title!: string;

  @ApiPropertyOptional({
    description: 'Book ids in editorial display order',
    example: [8, 9],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Transform(({ value }: { value: unknown }) => parseOptionalIdArray(value))
  bookIds?: number[];
}
