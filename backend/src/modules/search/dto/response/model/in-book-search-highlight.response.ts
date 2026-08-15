import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { InBookSearchHighlight } from '@/modules/search/defs/search-service.defs';

export class InBookSearchHighlightResponse {
  @ApiProperty({ description: 'Matched text run', example: 'Harbor' })
  text: string;

  @ApiProperty({ description: 'Horizontal position on the page', example: 120 })
  x: number;

  @ApiProperty({ description: 'Vertical position on the page', example: 80 })
  y: number;

  @ApiPropertyOptional({
    description: 'Run width when known',
    example: 80,
    nullable: true,
  })
  width: number | null;

  @ApiPropertyOptional({
    description: 'Run height when known',
    example: 20,
    nullable: true,
  })
  height: number | null;

  constructor(highlight: InBookSearchHighlight) {
    this.text = highlight.text;
    this.x = highlight.x;
    this.y = highlight.y;
    this.width = highlight.width;
    this.height = highlight.height;
  }
}
