import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

function parseTrimmedText(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return value.trim().replace(/\s+/g, ' ');
}

function parseOptionalTrimmedText(value: unknown): unknown {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    return value;
  }
  return value.trim();
}

export class CreateCategoryRequestDto {
  @ApiProperty({
    description: 'Display name for the category',
    example: 'Graphic Novels',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseTrimmedText(value))
  name!: string;

  @ApiPropertyOptional({
    description: 'Stable taxonomy slug. Omitted values are derived from the name.',
    example: 'graphic-novels',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseOptionalTrimmedText(value))
  slug?: string;

  @ApiPropertyOptional({
    description:
      'Configured weight applied to engagement when calculating author revenue. Omitted values default to 1.',
    example: 1.25,
    minimum: 0,
    exclusiveMinimum: true,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  categoryWeight?: number;
}
