import { ApiProperty } from '@nestjs/swagger';

import { AuthorEarningsPage } from '@/modules/monetization/defs/author-analytics-service.defs';
import { BookRevenueResponse } from '@/modules/monetization/dto/response/model/book-revenue.response';

export class GetAuthorEarningsResponseDto {
  @ApiProperty({ type: () => [BookRevenueResponse] })
  bookRevenues: BookRevenueResponse[];

  @ApiProperty({
    description: 'Total book revenue rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  @ApiProperty({
    description: 'Total author earnings in cents for this owner in the period',
    example: 7000,
  })
  authorCents: number;

  constructor(result: AuthorEarningsPage) {
    this.bookRevenues = result.page.entities.map((entity) => new BookRevenueResponse(entity));
    this.total = result.page.total;
    this.authorCents = result.authorCents;
  }
}
