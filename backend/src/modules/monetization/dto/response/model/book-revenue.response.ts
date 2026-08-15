import { ApiProperty } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';

export class BookRevenueResponse extends BaseModelResponseDto {
  @ApiProperty({ description: 'Revenue period id', example: 4 })
  revenuePeriodId: number;

  @ApiProperty({ description: 'Book id', example: 8 })
  bookId: number;

  @ApiProperty({ description: 'Owning publisher user id', example: 3 })
  ownerId: number;

  @ApiProperty({
    description: 'Weighted engagement minutes used to allocate the pool',
    example: 2.5,
  })
  weightedEngagement: number;

  @ApiProperty({
    description: 'Book share of the period pool in cents, including the platform cut',
    example: 3571,
  })
  poolShareCents: number;

  @ApiProperty({
    description: 'Platform cut allocated to this book in cents',
    example: 1071,
  })
  platformCutCents: number;

  @ApiProperty({
    description: 'Author earnings for this book in cents after the platform cut',
    example: 2500,
  })
  authorCents: number;

  constructor(entity: BookRevenueEntity) {
    super(entity);
    this.revenuePeriodId = entity.revenuePeriodId;
    this.bookId = entity.bookId;
    this.ownerId = entity.ownerId;
    this.weightedEngagement = entity.weightedEngagement;
    this.poolShareCents = entity.poolShareCents;
    this.platformCutCents = entity.platformCutCents;
    this.authorCents = entity.authorCents;
  }
}
