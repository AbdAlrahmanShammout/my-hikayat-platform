import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { InBookSearchHit } from '@/modules/search/defs/search-service.defs';
import { InBookSearchHighlightResponse } from '@/modules/search/dto/response/model/in-book-search-highlight.response';

export class InBookSearchHitResponse {
  @ApiProperty({
    description: 'Layout that produced this hit',
    enum: BookLayoutType,
    example: BookLayoutType.REFLOWABLE,
  })
  layoutType: BookLayoutType;

  @ApiProperty({ description: 'Zero-based spine locator', example: 0 })
  spineIndex: number;

  @ApiPropertyOptional({
    description: 'One-based page number for fixed-layout hits',
    example: 1,
    nullable: true,
  })
  pageNumber: number | null;

  @ApiPropertyOptional({
    description: 'Spread locator for fixed-layout hits',
    example: 0,
    nullable: true,
  })
  spreadIndex: number | null;

  @ApiProperty({ description: 'Chapter or page title', example: 'Dawn Watch' })
  title: string;

  @ApiProperty({
    description: 'Snippet around the first match',
    example: 'The Harbor lights were visible from the ridge.',
  })
  excerpt: string;

  @ApiProperty({ description: 'First match offset in the source text', example: 4 })
  matchOffset: number;

  @ApiProperty({ type: () => [InBookSearchHighlightResponse] })
  highlights: InBookSearchHighlightResponse[];

  constructor(hit: InBookSearchHit) {
    this.layoutType = hit.layoutType;
    this.spineIndex = hit.spineIndex;
    this.pageNumber = hit.pageNumber;
    this.spreadIndex = hit.spreadIndex;
    this.title = hit.title;
    this.excerpt = hit.excerpt;
    this.matchOffset = hit.matchOffset;
    this.highlights = hit.highlights.map(
      (highlight) => new InBookSearchHighlightResponse(highlight),
    );
  }
}
