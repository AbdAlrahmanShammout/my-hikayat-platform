import { ApiProperty } from '@nestjs/swagger';

import { InBookSearchPage } from '@/modules/search/defs/search-service.defs';
import { InBookSearchHitResponse } from '@/modules/search/dto/response/model/in-book-search-hit.response';

export class GetInBookSearchResponseDto {
  @ApiProperty({ type: () => [InBookSearchHitResponse] })
  hits: InBookSearchHitResponse[];

  @ApiProperty({
    description: 'Total hits matching the query, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: InBookSearchPage) {
    this.hits = page.hits.map((hit) => new InBookSearchHitResponse(hit));
    this.total = page.total;
  }
}
