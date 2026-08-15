import { Injectable } from '@nestjs/common';

import { BookLayoutType } from '@/modules/book/enum/general.enum';
import {
  EndReadingIntelligenceSessionServiceInput,
  FindCurrentReadingIntelligenceSessionServiceInput,
  IngestReadingActivityServiceInput,
  IngestReadingVisualEngagementServiceInput,
  ListReadingIntelligenceVisualEngagementsServiceInput,
  StartReadingIntelligenceSessionServiceInput,
} from '@/modules/reading-intelligence/defs/reading-intelligence-service.defs';
import { ReadingVisualEngagementPage } from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';
import { ReadingVisualEngagementNotFixedLayoutException } from '@/modules/reading-intelligence/exceptions/reading-visual-engagement-not-fixed-layout.exception';
import { ReadingVisualEngagementService } from '@/modules/reading-intelligence/reading-visual-engagement.service';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';

@Injectable()
export class ReadingIntelligenceService {
  constructor(
    private readonly readingSessionService: ReadingSessionService,
    private readonly readingVisualEngagementService: ReadingVisualEngagementService,
  ) {}

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

  async ingestVisualEngagement(
    input: IngestReadingVisualEngagementServiceInput,
  ): Promise<ReadingVisualEngagementEntity> {
    const session: ReadingSessionEntity =
      await this.readingSessionService.getOwnedOpenReadingSession({
        id: input.sessionId,
        userId: input.userId,
        bookId: input.bookId,
      });
    ReadingIntelligenceService.assertFixedLayout(session);
    return this.readingVisualEngagementService.recordReadingVisualEngagement({
      userId: session.userId,
      bookId: session.bookId,
      sessionId: session.id,
      spreadIndex: input.spreadIndex,
      pageNumber: input.pageNumber,
      activeDurationMs: input.activeDurationMs,
      visualSceneTimeMs: input.visualSceneTimeMs,
    });
  }

  async listVisualEngagements(
    input: ListReadingIntelligenceVisualEngagementsServiceInput,
  ): Promise<ReadingVisualEngagementPage> {
    const session: ReadingSessionEntity = await this.readingSessionService.getOwnedReadingSession({
      id: input.sessionId,
      userId: input.userId,
      bookId: input.bookId,
    });
    ReadingIntelligenceService.assertFixedLayout(session);
    return this.readingVisualEngagementService.listReadingVisualEngagements({
      userId: session.userId,
      bookId: session.bookId,
      sessionId: session.id,
      limit: input.limit,
      offset: input.offset,
    });
  }

  private static assertFixedLayout(session: ReadingSessionEntity): void {
    if (session.layoutType !== BookLayoutType.FIXED_LAYOUT) {
      throw new ReadingVisualEngagementNotFixedLayoutException(session.bookId);
    }
  }
}
