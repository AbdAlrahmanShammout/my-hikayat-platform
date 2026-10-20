import { ApiProperty } from '@nestjs/swagger';

import { BookReadingCycleResponse } from '@/modules/reading-completion/dto/response/model/book-reading-cycle.response';

export class GetReadingCompletionStatusesResponseDto {
  @ApiProperty({ type: [BookReadingCycleResponse] })
  cycles: BookReadingCycleResponse[];

  constructor(cycles: BookReadingCycleResponse[]) {
    this.cycles = cycles;
  }
}
