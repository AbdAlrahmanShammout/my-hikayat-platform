import { ApiProperty } from '@nestjs/swagger';

import { SpreadVisualDurationTotal } from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';

export class AuthorBookHeatmapCellResponse {
  @ApiProperty({ description: 'Fixed-layout spread index', example: 0 })
  spreadIndex: number;

  @ApiProperty({ description: 'Fixed-layout page number', example: 1 })
  pageNumber: number;

  @ApiProperty({
    description: 'Total active time spent on this spread in milliseconds',
    example: 180000,
  })
  activeDurationMs: number;

  @ApiProperty({
    description: 'Total visual scene time for this page or spread in milliseconds',
    example: 90000,
  })
  visualSceneTimeMs: number;

  constructor(cell: SpreadVisualDurationTotal) {
    this.spreadIndex = cell.spreadIndex;
    this.pageNumber = cell.pageNumber;
    this.activeDurationMs = cell.activeDurationMs;
    this.visualSceneTimeMs = cell.visualSceneTimeMs;
  }
}
