import { ApiProperty } from '@nestjs/swagger';

import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookHeatmap } from '@/modules/monetization/defs/book-heatmap-service.defs';
import { AuthorBookChapterHeatmapCellResponse } from '@/modules/monetization/dto/response/model/author-book-chapter-heatmap-cell.response';
import { AuthorBookHeatmapCellResponse } from '@/modules/monetization/dto/response/model/author-book-heatmap-cell.response';

export class GetAdminPeriodBookHeatmapResponseDto {
  @ApiProperty({ description: 'Book id', example: 10 })
  bookId: number;

  @ApiProperty({ description: 'Revenue period id', example: 4 })
  revenuePeriodId: number;

  @ApiProperty({
    description: 'Book layout that selected the heatmap cell model',
    enum: BookLayoutType,
    example: BookLayoutType.FIXED_LAYOUT,
    nullable: true,
  })
  layoutType: BookLayoutType | null;

  @ApiProperty({ type: () => [AuthorBookHeatmapCellResponse] })
  spreads: AuthorBookHeatmapCellResponse[];

  @ApiProperty({ type: () => [AuthorBookChapterHeatmapCellResponse] })
  chapters: AuthorBookChapterHeatmapCellResponse[];

  constructor(heatmap: BookHeatmap) {
    this.bookId = heatmap.bookId;
    this.revenuePeriodId = heatmap.revenuePeriodId;
    this.layoutType = heatmap.layoutType;
    this.spreads = heatmap.spreads.map((cell) => new AuthorBookHeatmapCellResponse(cell));
    this.chapters = heatmap.chapters.map((cell) => new AuthorBookChapterHeatmapCellResponse(cell));
  }
}
