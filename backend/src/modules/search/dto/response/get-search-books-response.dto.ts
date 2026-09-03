import { ApiProperty } from '@nestjs/swagger';

import { BookResponse } from '@/modules/book/dto/response/model/book.response';

export class GetSearchBooksResponseDto {
  @ApiProperty({ type: () => [BookResponse] })
  books: BookResponse[];

  @ApiProperty({
    description: 'Total rows matching the search, across all pages',
    example: 450,
  })
  total: number;

  constructor(books: readonly BookResponse[], total: number) {
    this.books = [...books];
    this.total = total;
  }
}
