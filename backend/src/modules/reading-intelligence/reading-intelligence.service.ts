import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ChapterDurationTotal } from '@/modules/reading-intelligence/defs/reading-chapter-engagement-repository.defs';
import {
  BookEngagementSignal,
  EndReadingIntelligenceSessionServiceInput,
  FindCurrentReadingIntelligenceSessionServiceInput,
  IngestReadingActivityServiceInput,
  IngestReadingVisualEngagementServiceInput,
  ListBookEngagementSignalsServiceInput,
  ListChapterEngagementTotalsServiceInput,
  ListReadingIntelligenceVisualEngagementsServiceInput,
  ListSpreadEngagementTotalsServiceInput,
  StartReadingIntelligenceSessionServiceInput,
} from '@/modules/reading-intelligence/defs/reading-intelligence-service.defs';
import {
  ReadingVisualEngagementPage,
  SpreadVisualDurationTotal,
} from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';
import { ReadingVisualEngagementNotFixedLayoutException } from '@/modules/reading-intelligence/exceptions/reading-visual-engagement-not-fixed-layout.exception';
import { ReadingChapterEngagementService } from '@/modules/reading-intelligence/reading-chapter-engagement.service';
import { ReadingVisualEngagementService } from '@/modules/reading-intelligence/reading-visual-engagement.service';
import { resolveReadingChapterSpineIndex } from '@/modules/reading-intelligence/resolve-reading-chapter-spine-index.helper';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionTotalsService } from '@/modules/reading/reading-session-totals.service';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';

type RecordReflowableChapterEngagementInput = {
  readonly session: ReadingSessionEntity;
  readonly payloadSpineIndex?: number | null;
  readonly activeDurationMs?: number;
  readonly context?: TransactionContext;
};

@Injectable()
export class ReadingIntelligenceService {
  constructor(
    private readonly readingSessionService: ReadingSessionService,
    private readonly readingSessionTotalsService: ReadingSessionTotalsService,
    private readonly readingVisualEngagementService: ReadingVisualEngagementService,
    private readonly readingChapterEngagementService: ReadingChapterEngagementService,
    private readonly transactionRunner: TransactionRunner,
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
    return this.transactionRunner.run(async (context) => {
      const session: ReadingSessionEntity =
        await this.readingSessionService.recordReadingSessionActivity(
          {
            id: input.sessionId,
            userId: input.userId,
            bookId: input.bookId,
            activeDurationMs: input.activeDurationMs,
            idleDurationMs: input.idleDurationMs,
            spineIndex: input.spineIndex,
            scrollOffset: input.scrollOffset,
            spreadIndex: input.spreadIndex,
            pageNumber: input.pageNumber,
          },
          context,
        );
      await this.recordReflowableChapterEngagement({
        session,
        payloadSpineIndex: input.spineIndex,
        activeDurationMs: input.activeDurationMs,
        context,
      });
      return session;
    });
  }

  async endReadingSession(
    input: EndReadingIntelligenceSessionServiceInput,
  ): Promise<ReadingSessionEntity> {
    return this.transactionRunner.run(async (context) => {
      const session: ReadingSessionEntity = await this.readingSessionService.endReadingSession(
        {
          id: input.sessionId,
          userId: input.userId,
          bookId: input.bookId,
          activeDurationMs: input.activeDurationMs,
          idleDurationMs: input.idleDurationMs,
          spineIndex: input.spineIndex,
          scrollOffset: input.scrollOffset,
          spreadIndex: input.spreadIndex,
          pageNumber: input.pageNumber,
        },
        context,
      );
      await this.recordReflowableChapterEngagement({
        session,
        payloadSpineIndex: input.spineIndex,
        activeDurationMs: input.activeDurationMs,
        context,
      });
      return session;
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

  async listBookEngagementSignalsInRange(
    input: ListBookEngagementSignalsServiceInput,
  ): Promise<BookEngagementSignal[]> {
    const reflowableTotals = await this.readingSessionTotalsService.sumActiveDurationByBookInRange({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      layoutType: BookLayoutType.REFLOWABLE,
    });
    const visualTotals = await this.readingVisualEngagementService.sumDurationsByBookInRange({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    });
    return [
      ...reflowableTotals
        .filter((total) => total.activeDurationMs > 0)
        .map((total) => ({
          bookId: total.bookId,
          layoutType: BookLayoutType.REFLOWABLE,
          activeDurationMs: total.activeDurationMs,
          visualSceneTimeMs: 0,
        })),
      ...visualTotals
        .filter((total) => total.activeDurationMs > 0 || total.visualSceneTimeMs > 0)
        .map((total) => ({
          bookId: total.bookId,
          layoutType: BookLayoutType.FIXED_LAYOUT,
          activeDurationMs: total.activeDurationMs,
          visualSceneTimeMs: total.visualSceneTimeMs,
        })),
    ];
  }

  async listSpreadEngagementTotalsForBook(
    input: ListSpreadEngagementTotalsServiceInput,
  ): Promise<SpreadVisualDurationTotal[]> {
    return this.readingVisualEngagementService.sumDurationsBySpreadInRange(input);
  }

  async listChapterEngagementTotalsForBook(
    input: ListChapterEngagementTotalsServiceInput,
  ): Promise<ChapterDurationTotal[]> {
    return this.readingChapterEngagementService.sumDurationsByChapterInRange(input);
  }

  private async recordReflowableChapterEngagement(
    input: RecordReflowableChapterEngagementInput,
  ): Promise<void> {
    if (input.session.layoutType !== BookLayoutType.REFLOWABLE) {
      return;
    }
    if (input.activeDurationMs === undefined || input.activeDurationMs <= 0) {
      return;
    }
    const spineIndex: number | null = resolveReadingChapterSpineIndex(
      input.payloadSpineIndex,
      input.session.spineIndex,
    );
    if (spineIndex === null) {
      return;
    }
    await this.readingChapterEngagementService.recordReadingChapterEngagement(
      {
        userId: input.session.userId,
        bookId: input.session.bookId,
        sessionId: input.session.id,
        spineIndex,
        activeDurationMs: input.activeDurationMs,
      },
      input.context,
    );
  }

  private static assertFixedLayout(session: ReadingSessionEntity): void {
    if (session.layoutType !== BookLayoutType.FIXED_LAYOUT) {
      throw new ReadingVisualEngagementNotFixedLayoutException(session.bookId);
    }
  }
}
