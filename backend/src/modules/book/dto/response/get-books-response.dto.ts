import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AdminBookAppliedFilters } from '@/modules/book/dto/response/admin-book-applied-filters';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';

export class GetBooksResponseDto {
  @ApiProperty({ type: () => [BookResponse] })
  books: BookResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 450,
  })
  total: number;

  @ApiPropertyOptional({ type: () => AdminBookAppliedFilters })
  appliedFilters?: AdminBookAppliedFilters;

  constructor(
    books: readonly BookResponse[],
    total: number,
    appliedFilters?: AdminBookAppliedFilters,
  ) {
    this.books = [...books];
    this.total = total;
    if (appliedFilters !== undefined) {
      this.appliedFilters = appliedFilters;
    }
  }
}
