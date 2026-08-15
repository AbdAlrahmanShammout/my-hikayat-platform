import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNumber, Min } from 'class-validator';

function parseIdArray(value: unknown): unknown {
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

export class ReorderCollectionBooksRequestDto {
  @ApiProperty({
    description: 'Complete list of current book ids in the new editorial order',
    example: [9, 8],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Transform(({ value }: { value: unknown }) => parseIdArray(value))
  bookIds!: number[];
}
