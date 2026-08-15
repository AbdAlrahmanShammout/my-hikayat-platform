import { ApiProperty } from '@nestjs/swagger';

import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';

export class GetBooksResponseDto {
  @ApiProperty({ type: () => [BookResponse] })
  books: BookResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 450,
  })
  total: number;

  constructor(page: BookPage) {
    this.books = page.entities.map((entity) => new BookResponse(entity));
    this.total = page.total;
  }
}
