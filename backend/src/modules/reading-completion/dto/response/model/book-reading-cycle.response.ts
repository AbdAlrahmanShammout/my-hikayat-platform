import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseModelResponseDto } from '@/common/base/base-model.response.dto';
import { BookReadingCycleEntity } from '@/modules/reading-completion/entity/book-reading-cycle.entity';
import { ReadingCompletionStatus } from '@/modules/reading-completion/enum/general.enum';

export class BookReadingCycleResponse extends BaseModelResponseDto {
  @ApiProperty({ example: 8 })
  bookId: number;

  @ApiProperty({ enum: ReadingCompletionStatus, example: ReadingCompletionStatus.IN_PROGRESS })
  status: ReadingCompletionStatus;

  @ApiPropertyOptional({ example: 4, nullable: true })
  lastPageRead: number | null;

  constructor(entity: BookReadingCycleEntity) {
    super(entity);
    this.bookId = entity.bookId;
    this.status = entity.status;
    this.lastPageRead = entity.lastPageRead;
  }
}
