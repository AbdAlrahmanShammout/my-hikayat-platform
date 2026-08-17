import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

function parseRejectionReason(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return value.trim();
}

export class RejectBookRequestDto {
  @ApiProperty({
    description: 'Required explanation stored on the book_rejected audit record',
    example: 'Cover art is unreadable at catalog size.',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => parseRejectionReason(value))
  reason!: string;
}
