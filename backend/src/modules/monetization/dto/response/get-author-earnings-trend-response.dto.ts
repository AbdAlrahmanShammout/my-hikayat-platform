import { ApiProperty } from '@nestjs/swagger';

import { AuthorEarningsTrendPage } from '@/modules/monetization/defs/author-analytics-service.defs';
import { AuthorEarningsTrendPointResponse } from '@/modules/monetization/dto/response/model/author-earnings-trend-point.response';

export class GetAuthorEarningsTrendResponseDto {
  @ApiProperty({ type: () => [AuthorEarningsTrendPointResponse] })
  points: AuthorEarningsTrendPointResponse[];

  @ApiProperty({
    description: 'Total revenue periods matching the filter, across all pages',
    example: 6,
  })
  total: number;

  constructor(page: AuthorEarningsTrendPage) {
    this.points = page.entities.map((point) => new AuthorEarningsTrendPointResponse(point));
    this.total = page.total;
  }
}
