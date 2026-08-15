import { Injectable } from '@nestjs/common';

import {
  BookActiveDurationTotal,
  SumReadingSessionActiveDurationRepoInput,
} from '@/modules/reading/defs/reading-session-repository.defs';
import { ReadingSessionRepository } from '@/modules/reading/repository/reading-session.repository';

@Injectable()
export class ReadingSessionTotalsService {
  constructor(private readonly readingSessionRepository: ReadingSessionRepository) {}

  async sumActiveDurationByBookInRange(
    input: SumReadingSessionActiveDurationRepoInput,
  ): Promise<BookActiveDurationTotal[]> {
    return this.readingSessionRepository.sumActiveDurationByBookInRange(input);
  }
}
