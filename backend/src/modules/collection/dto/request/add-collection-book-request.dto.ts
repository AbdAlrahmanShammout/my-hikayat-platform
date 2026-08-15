import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AddCollectionBookRequestDto {
  @ApiProperty({
    description: 'Book to append to the collection',
    example: 8,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  bookId!: number;
}
