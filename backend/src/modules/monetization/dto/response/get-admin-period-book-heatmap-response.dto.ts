import { ApiProperty } from '@nestjs/swagger';

import { AdminPeriodBookHeatmap } from '@/modules/monetization/defs/admin-analytics-service.defs';
import { AuthorBookHeatmapCellResponse } from '@/modules/monetization/dto/response/model/author-book-heatmap-cell.response';

export class GetAdminPeriodBookHeatmapResponseDto {
  @ApiProperty({ description: 'Book id', example: 10 })
  bookId: number;

  @ApiProperty({ description: 'Revenue period id', example: 4 })
  revenuePeriodId: number;

  @ApiProperty({ type: () => [AuthorBookHeatmapCellResponse] })
  spreads: AuthorBookHeatmapCellResponse[];

  constructor(heatmap: AdminPeriodBookHeatmap) {
    this.bookId = heatmap.bookId;
    this.revenuePeriodId = heatmap.revenuePeriodId;
    this.spreads = heatmap.cells.map((cell) => new AuthorBookHeatmapCellResponse(cell));
  }
}
