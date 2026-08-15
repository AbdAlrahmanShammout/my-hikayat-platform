import { Injectable } from '@nestjs/common';

import {
  EndReadingIntelligenceSessionServiceInput,
  FindCurrentReadingIntelligenceSessionServiceInput,
  IngestReadingActivityServiceInput,
  StartReadingIntelligenceSessionServiceInput,
} from '@/modules/reading-intelligence/defs/reading-intelligence-service.defs';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';

@Injectable()
export class ReadingIntelligenceService {
  constructor(private readonly readingSessionService: ReadingSessionService) {}

  async startReadingSession(
    input: StartReadingIntelligenceSessionServiceInput,
  ): Promise<ReadingSessionEntity> {
    return this.readingSessionService.startReadingSession({
      userId: input.userId,
      bookId: input.bookId,
      spineIndex: input.spineIndex,
      scrollOffset: input.scrollOffset,
      spreadIndex: input.spreadIndex,
      pageNumber: input.pageNumber,
    });
  }

  async ingestReadingActivity(
    input: IngestReadingActivityServiceInput,
  ): Promise<ReadingSessionEntity> {
    return this.readingSessionService.recordReadingSessionActivity({
      id: input.sessionId,
      userId: input.userId,
      bookId: input.bookId,
      activeDurationMs: input.activeDurationMs,
      idleDurationMs: input.idleDurationMs,
      spineIndex: input.spineIndex,
      scrollOffset: input.scrollOffset,
      spreadIndex: input.spreadIndex,
      pageNumber: input.pageNumber,
    });
  }

  async endReadingSession(
    input: EndReadingIntelligenceSessionServiceInput,
  ): Promise<ReadingSessionEntity> {
    return this.readingSessionService.endReadingSession({
      id: input.sessionId,
      userId: input.userId,
      bookId: input.bookId,
      activeDurationMs: input.activeDurationMs,
      idleDurationMs: input.idleDurationMs,
      spineIndex: input.spineIndex,
      scrollOffset: input.scrollOffset,
      spreadIndex: input.spreadIndex,
      pageNumber: input.pageNumber,
    });
  }

  async getCurrentReadingSession(
    input: FindCurrentReadingIntelligenceSessionServiceInput,
  ): Promise<ReadingSessionEntity> {
    return this.readingSessionService.getOpenReadingSessionByUserAndBook({
      userId: input.userId,
      bookId: input.bookId,
    });
  }
}
