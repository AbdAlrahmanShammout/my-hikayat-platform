import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';

function parseDateValue(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  const parsed: Date = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export class CreateRevenuePeriodRequestDto {
  @ApiProperty({
    description: 'Inclusive UTC start of the revenue period',
    example: '2098-08-01T00:00:00.000Z',
  })
  @IsDate()
  @Transform(({ value }: { value: unknown }) => parseDateValue(value))
  startsAt!: Date;

  @ApiProperty({
    description: 'Exclusive UTC end of the revenue period',
    example: '2098-09-01T00:00:00.000Z',
  })
  @IsDate()
  @Transform(({ value }: { value: unknown }) => parseDateValue(value))
  endsAt!: Date;
}
