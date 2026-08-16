import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BookHeatmapChapterCell } from '@/modules/monetization/defs/book-heatmap-service.defs';

export class AuthorBookChapterHeatmapCellResponse {
  @ApiProperty({ description: 'Reflowable spine index', example: 0 })
  spineIndex: number;

  @ApiPropertyOptional({
    description: 'Book chapter title when a matching BookChapter exists',
    example: 'The Harbor',
    nullable: true,
  })
  title: string | null;

  @ApiProperty({
    description: 'Total active time spent in this chapter in milliseconds',
    example: 120000,
  })
  activeDurationMs: number;

  constructor(cell: BookHeatmapChapterCell) {
    this.spineIndex = cell.spineIndex;
    this.title = cell.title;
    this.activeDurationMs = cell.activeDurationMs;
  }
}
