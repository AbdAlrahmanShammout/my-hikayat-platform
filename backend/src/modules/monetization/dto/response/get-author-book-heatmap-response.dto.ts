import { ApiProperty } from '@nestjs/swagger';

import { AuthorBookHeatmap } from '@/modules/monetization/defs/author-analytics-service.defs';
import { AuthorBookHeatmapCellResponse } from '@/modules/monetization/dto/response/model/author-book-heatmap-cell.response';

export class GetAuthorBookHeatmapResponseDto {
  @ApiProperty({ description: 'Book id', example: 10 })
  bookId: number;

  @ApiProperty({ description: 'Revenue period id', example: 4 })
  revenuePeriodId: number;

  @ApiProperty({ type: () => [AuthorBookHeatmapCellResponse] })
  spreads: AuthorBookHeatmapCellResponse[];

  constructor(heatmap: AuthorBookHeatmap) {
    this.bookId = heatmap.bookId;
    this.revenuePeriodId = heatmap.revenuePeriodId;
    this.spreads = heatmap.cells.map((cell) => new AuthorBookHeatmapCellResponse(cell));
  }
}
