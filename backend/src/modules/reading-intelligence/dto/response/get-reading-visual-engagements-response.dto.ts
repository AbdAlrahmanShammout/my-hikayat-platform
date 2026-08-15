import { ApiProperty } from '@nestjs/swagger';

import { ReadingVisualEngagementPage } from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';
import { ReadingVisualEngagementResponse } from '@/modules/reading-intelligence/dto/response/model/reading-visual-engagement.response';

export class GetReadingVisualEngagementsResponseDto {
  @ApiProperty({ type: () => [ReadingVisualEngagementResponse] })
  visualEngagements: ReadingVisualEngagementResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: ReadingVisualEngagementPage) {
    this.visualEngagements = page.entities.map(
      (entity) => new ReadingVisualEngagementResponse(entity),
    );
    this.total = page.total;
  }
}
