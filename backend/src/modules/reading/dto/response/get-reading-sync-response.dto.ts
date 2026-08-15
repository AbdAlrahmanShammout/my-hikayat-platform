import { ApiProperty } from '@nestjs/swagger';

import { ReadingSyncSnapshot } from '@/modules/reading/defs/reading-sync-service.defs';
import { ReadingBookmarkResponse } from '@/modules/reading/dto/response/model/reading-bookmark.response';
import { ReadingProgressResponse } from '@/modules/reading/dto/response/model/reading-progress.response';

export class GetReadingSyncResponseDto {
  @ApiProperty({ type: () => [ReadingProgressResponse] })
  progress: ReadingProgressResponse[];

  @ApiProperty({
    description: 'Total progress rows matching the filter, across all pages',
    example: 2,
  })
  progressTotal: number;

  @ApiProperty({ type: () => [ReadingBookmarkResponse] })
  bookmarks: ReadingBookmarkResponse[];

  @ApiProperty({
    description: 'Total bookmark rows matching the filter, across all pages',
    example: 4,
  })
  bookmarksTotal: number;

  constructor(snapshot: ReadingSyncSnapshot) {
    this.progress = snapshot.progress.entities.map((entity) => new ReadingProgressResponse(entity));
    this.progressTotal = snapshot.progress.total;
    this.bookmarks = snapshot.bookmarks.entities.map(
      (entity) => new ReadingBookmarkResponse(entity),
    );
    this.bookmarksTotal = snapshot.bookmarks.total;
  }
}
