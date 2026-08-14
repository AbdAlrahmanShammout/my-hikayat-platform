import { ApiProperty } from '@nestjs/swagger';

export class BaseModelResponseDto {
  @ApiProperty({ description: 'Stable identifier', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(data: { id: number; createdAt: Date; updatedAt: Date }) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
