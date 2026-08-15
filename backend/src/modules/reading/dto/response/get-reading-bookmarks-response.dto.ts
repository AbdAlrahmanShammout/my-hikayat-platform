import { ApiProperty } from '@nestjs/swagger';

import { ReadingBookmarkPage } from '@/modules/reading/defs/reading-bookmark-repository.defs';
import { ReadingBookmarkResponse } from '@/modules/reading/dto/response/model/reading-bookmark.response';

export class GetReadingBookmarksResponseDto {
  @ApiProperty({ type: () => [ReadingBookmarkResponse] })
  bookmarks: ReadingBookmarkResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: ReadingBookmarkPage) {
    this.bookmarks = page.entities.map((entity) => new ReadingBookmarkResponse(entity));
    this.total = page.total;
  }
}
