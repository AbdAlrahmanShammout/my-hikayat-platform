import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingChapterEngagementEntity } from '@/modules/reading-intelligence/entity/reading-chapter-engagement.entity';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';
import { ReadingVisualEngagementNotFixedLayoutException } from '@/modules/reading-intelligence/exceptions/reading-visual-engagement-not-fixed-layout.exception';
import { ReadingChapterEngagementService } from '@/modules/reading-intelligence/reading-chapter-engagement.service';
import { ReadingVisualEngagementService } from '@/modules/reading-intelligence/reading-visual-engagement.service';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionTotalsService } from '@/modules/reading/reading-session-totals.service';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';

import { ReadingIntelligenceService } from './reading-intelligence.service';

function createOpenSession(
  layoutType: BookLayoutType,
  spineIndex: number | null = layoutType === BookLayoutType.REFLOWABLE ? 1 : null,
): ReadingSessionEntity {
  return new ReadingSessionEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    layoutType,
    startedAt: new Date('2026-01-01T01:00:00.000Z'),
    endedAt: null,
    activeDurationMs: 0,
    idleDurationMs: 0,
    spineIndex,
    scrollOffset: layoutType === BookLayoutType.REFLOWABLE ? 120 : null,
    spreadIndex: layoutType === BookLayoutType.FIXED_LAYOUT ? 1 : null,
    pageNumber: layoutType === BookLayoutType.FIXED_LAYOUT ? 3 : null,
  });
}

function createSampleVisualEngagement(): ReadingVisualEngagementEntity {
  return new ReadingVisualEngagementEntity({
    id: 11,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    sessionId: 9,
    layoutType: BookLayoutType.FIXED_LAYOUT,
    spreadIndex: 1,
    pageNumber: 3,
    activeDurationMs: 15000,
    visualSceneTimeMs: 12000,
  });
}

function createSampleChapterEngagement(): ReadingChapterEngagementEntity {
  return new ReadingChapterEngagementEntity({
    id: 12,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    sessionId: 9,
    layoutType: BookLayoutType.REFLOWABLE,
    spineIndex: 2,
    activeDurationMs: 15000,
  });
}

describe('ReadingIntelligenceService', () => {
  let mockReadingSessionService: {
    startReadingSession: jest.Mock;
    recordReadingSessionActivity: jest.Mock;
    endReadingSession: jest.Mock;
    getOpenReadingSessionByUserAndBook: jest.Mock;
    getOwnedReadingSession: jest.Mock;
    getOwnedOpenReadingSession: jest.Mock;
  };
  let mockReadingVisualEngagementService: {
    recordReadingVisualEngagement: jest.Mock;
    listReadingVisualEngagements: jest.Mock;
    sumDurationsByBookInRange: jest.Mock;
    sumDurationsBySpreadInRange: jest.Mock;
  };
  let mockReadingChapterEngagementService: {
    recordReadingChapterEngagement: jest.Mock;
    sumDurationsByBookInRange: jest.Mock;
    sumDurationsByChapterInRange: jest.Mock;
  };
  let mockReadingSessionTotalsService: {
    sumActiveDurationByBookInRange: jest.Mock;
  };
  let mockTransactionRunner: { run: jest.Mock };
  let readingIntelligenceService: ReadingIntelligenceService;

  beforeEach(() => {
    mockReadingSessionService = {
      startReadingSession: jest.fn(),
      recordReadingSessionActivity: jest.fn(),
      endReadingSession: jest.fn(),
      getOpenReadingSessionByUserAndBook: jest.fn(),
      getOwnedReadingSession: jest.fn(),
      getOwnedOpenReadingSession: jest.fn(),
    };
    mockReadingVisualEngagementService = {
      recordReadingVisualEngagement: jest.fn(),
      listReadingVisualEngagements: jest.fn(),
      sumDurationsByBookInRange: jest.fn(),
      sumDurationsBySpreadInRange: jest.fn(),
    };
    mockReadingChapterEngagementService = {
      recordReadingChapterEngagement: jest.fn(),
      sumDurationsByBookInRange: jest.fn(),
      sumDurationsByChapterInRange: jest.fn(),
    };
    mockReadingSessionTotalsService = {
      sumActiveDurationByBookInRange: jest.fn(),
    };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    readingIntelligenceService = new ReadingIntelligenceService(
      mockReadingSessionService as unknown as ReadingSessionService,
      mockReadingSessionTotalsService as unknown as ReadingSessionTotalsService,
      mockReadingVisualEngagementService as unknown as ReadingVisualEngagementService,
      mockReadingChapterEngagementService as unknown as ReadingChapterEngagementService,
      mockTransactionRunner,
    );
  });

  it('starts a session through the reading session service', async () => {
    const expectedSession = createOpenSession(BookLayoutType.REFLOWABLE);
    mockReadingSessionService.startReadingSession.mockResolvedValue(expectedSession);
    const actualSession = await readingIntelligenceService.startReadingSession({
      userId: 7,
      bookId: 8,
      spineIndex: 1,
      scrollOffset: 120,
    });
    expect(mockReadingSessionService.startReadingSession).toHaveBeenCalledWith({
      userId: 7,
      bookId: 8,
      spineIndex: 1,
      scrollOffset: 120,
      spreadIndex: undefined,
      pageNumber: undefined,
    });
    expect(actualSession).toBe(expectedSession);
  });

  it('ingests an active vs idle interval onto the open session and the chapter ledger', async () => {
    const expectedSession = createOpenSession(BookLayoutType.REFLOWABLE);
    mockReadingSessionService.recordReadingSessionActivity.mockResolvedValue(expectedSession);
    mockReadingChapterEngagementService.recordReadingChapterEngagement.mockResolvedValue(
      createSampleChapterEngagement(),
    );
    const actualSession = await readingIntelligenceService.ingestReadingActivity({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      activeDurationMs: 15000,
      idleDurationMs: 3000,
      spineIndex: 2,
      scrollOffset: 400,
    });
    expect(mockReadingSessionService.recordReadingSessionActivity).toHaveBeenCalledWith(
      {
        id: 9,
        userId: 7,
        bookId: 8,
        activeDurationMs: 15000,
        idleDurationMs: 3000,
        spineIndex: 2,
        scrollOffset: 400,
        spreadIndex: undefined,
        pageNumber: undefined,
      },
      undefined,
    );
    expect(mockReadingChapterEngagementService.recordReadingChapterEngagement).toHaveBeenCalledWith(
      {
        userId: 7,
        bookId: 8,
        sessionId: 9,
        spineIndex: 2,
        activeDurationMs: 15000,
      },
      undefined,
    );
    expect(actualSession).toBe(expectedSession);
  });

  it('attributes activity to the session spine index when the payload omits it', async () => {
    mockReadingSessionService.recordReadingSessionActivity.mockResolvedValue(
      createOpenSession(BookLayoutType.REFLOWABLE, 1),
    );
    await readingIntelligenceService.ingestReadingActivity({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      activeDurationMs: 8000,
      idleDurationMs: 0,
    });
    expect(mockReadingChapterEngagementService.recordReadingChapterEngagement).toHaveBeenCalledWith(
      expect.objectContaining({
        spineIndex: 1,
        activeDurationMs: 8000,
      }),
      undefined,
    );
  });

  it('skips the chapter ledger when active duration is zero', async () => {
    mockReadingSessionService.recordReadingSessionActivity.mockResolvedValue(
      createOpenSession(BookLayoutType.REFLOWABLE),
    );
    await readingIntelligenceService.ingestReadingActivity({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      activeDurationMs: 0,
      idleDurationMs: 3000,
      spineIndex: 2,
      scrollOffset: 400,
    });
    expect(mockReadingSessionService.recordReadingSessionActivity).toHaveBeenCalled();
    expect(
      mockReadingChapterEngagementService.recordReadingChapterEngagement,
    ).not.toHaveBeenCalled();
  });

  it('skips the chapter ledger when the session has no resolvable spine index', async () => {
    mockReadingSessionService.recordReadingSessionActivity.mockResolvedValue(
      createOpenSession(BookLayoutType.REFLOWABLE, null),
    );
    await readingIntelligenceService.ingestReadingActivity({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      activeDurationMs: 8000,
      idleDurationMs: 0,
    });
    expect(mockReadingSessionService.recordReadingSessionActivity).toHaveBeenCalled();
    expect(
      mockReadingChapterEngagementService.recordReadingChapterEngagement,
    ).not.toHaveBeenCalled();
  });

  it('does not write chapter rows for fixed-layout activity', async () => {
    mockReadingSessionService.recordReadingSessionActivity.mockResolvedValue(
      createOpenSession(BookLayoutType.FIXED_LAYOUT),
    );
    await readingIntelligenceService.ingestReadingActivity({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      activeDurationMs: 15000,
      idleDurationMs: 0,
      spreadIndex: 1,
      pageNumber: 3,
    });
    expect(
      mockReadingChapterEngagementService.recordReadingChapterEngagement,
    ).not.toHaveBeenCalled();
  });

  it('attributes a final active interval onto the chapter ledger when a reflowable session ends', async () => {
    const expectedSession = createOpenSession(BookLayoutType.REFLOWABLE, 4);
    mockReadingSessionService.endReadingSession.mockResolvedValue(expectedSession);
    const actualSession = await readingIntelligenceService.endReadingSession({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      activeDurationMs: 5000,
      idleDurationMs: 1000,
      spineIndex: 4,
      scrollOffset: 80,
    });
    expect(mockReadingSessionService.endReadingSession).toHaveBeenCalledWith(
      {
        id: 9,
        userId: 7,
        bookId: 8,
        activeDurationMs: 5000,
        idleDurationMs: 1000,
        spineIndex: 4,
        scrollOffset: 80,
        spreadIndex: undefined,
        pageNumber: undefined,
      },
      undefined,
    );
    expect(mockReadingChapterEngagementService.recordReadingChapterEngagement).toHaveBeenCalledWith(
      {
        userId: 7,
        bookId: 8,
        sessionId: 9,
        spineIndex: 4,
        activeDurationMs: 5000,
      },
      undefined,
    );
    expect(actualSession).toBe(expectedSession);
  });

  it('does not write a chapter row when a session ends without a final active interval', async () => {
    mockReadingSessionService.endReadingSession.mockResolvedValue(
      createOpenSession(BookLayoutType.REFLOWABLE),
    );
    await readingIntelligenceService.endReadingSession({
      userId: 7,
      bookId: 8,
      sessionId: 9,
    });
    expect(
      mockReadingChapterEngagementService.recordReadingChapterEngagement,
    ).not.toHaveBeenCalled();
  });

  it('ingests visual engagement for an open fixed-layout session', async () => {
    const expectedEngagement = createSampleVisualEngagement();
    mockReadingSessionService.getOwnedOpenReadingSession.mockResolvedValue(
      createOpenSession(BookLayoutType.FIXED_LAYOUT),
    );
    mockReadingVisualEngagementService.recordReadingVisualEngagement.mockResolvedValue(
      expectedEngagement,
    );
    const actualEngagement = await readingIntelligenceService.ingestVisualEngagement({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      spreadIndex: 1,
      pageNumber: 3,
      activeDurationMs: 15000,
      visualSceneTimeMs: 12000,
    });
    expect(mockReadingVisualEngagementService.recordReadingVisualEngagement).toHaveBeenCalledWith({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      spreadIndex: 1,
      pageNumber: 3,
      activeDurationMs: 15000,
      visualSceneTimeMs: 12000,
    });
    expect(actualEngagement).toBe(expectedEngagement);
  });

  it('rejects visual engagement ingest for a reflowable session', async () => {
    mockReadingSessionService.getOwnedOpenReadingSession.mockResolvedValue(
      createOpenSession(BookLayoutType.REFLOWABLE),
    );
    await expect(
      readingIntelligenceService.ingestVisualEngagement({
        userId: 7,
        bookId: 8,
        sessionId: 9,
        spreadIndex: 1,
        pageNumber: 3,
        activeDurationMs: 15000,
        visualSceneTimeMs: 12000,
      }),
    ).rejects.toBeInstanceOf(ReadingVisualEngagementNotFixedLayoutException);
    expect(mockReadingVisualEngagementService.recordReadingVisualEngagement).not.toHaveBeenCalled();
  });

  it('lists reflowable and fixed-layout engagement signals for a range from session totals', async () => {
    const inputRange = {
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
    };
    mockReadingSessionTotalsService.sumActiveDurationByBookInRange.mockResolvedValue([
      { bookId: 8, activeDurationMs: 120000 },
      { bookId: 9, activeDurationMs: 0 },
    ]);
    mockReadingVisualEngagementService.sumDurationsByBookInRange.mockResolvedValue([
      { bookId: 10, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
    ]);
    const actualSignals =
      await readingIntelligenceService.listBookEngagementSignalsInRange(inputRange);
    expect(mockReadingSessionTotalsService.sumActiveDurationByBookInRange).toHaveBeenCalledWith({
      ...inputRange,
      layoutType: BookLayoutType.REFLOWABLE,
    });
    expect(mockReadingChapterEngagementService.sumDurationsByBookInRange).not.toHaveBeenCalled();
    expect(actualSignals).toEqual([
      {
        bookId: 8,
        layoutType: BookLayoutType.REFLOWABLE,
        activeDurationMs: 120000,
        visualSceneTimeMs: 0,
      },
      {
        bookId: 10,
        layoutType: BookLayoutType.FIXED_LAYOUT,
        activeDurationMs: 180000,
        visualSceneTimeMs: 90000,
      },
    ]);
  });

  it('lists spread engagement totals for a book in a range', async () => {
    const inputRange = {
      bookId: 10,
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
    };
    const expectedCells = [
      { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
    ];
    mockReadingVisualEngagementService.sumDurationsBySpreadInRange.mockResolvedValue(expectedCells);
    const actualCells =
      await readingIntelligenceService.listSpreadEngagementTotalsForBook(inputRange);
    expect(mockReadingVisualEngagementService.sumDurationsBySpreadInRange).toHaveBeenCalledWith(
      inputRange,
    );
    expect(actualCells).toBe(expectedCells);
  });

  it('lists chapter engagement totals for a book in a range', async () => {
    const inputRange = {
      bookId: 8,
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
    };
    const expectedCells = [{ spineIndex: 0, activeDurationMs: 120000 }];
    mockReadingChapterEngagementService.sumDurationsByChapterInRange.mockResolvedValue(
      expectedCells,
    );
    const actualCells =
      await readingIntelligenceService.listChapterEngagementTotalsForBook(inputRange);
    expect(mockReadingChapterEngagementService.sumDurationsByChapterInRange).toHaveBeenCalledWith(
      inputRange,
    );
    expect(actualCells).toBe(expectedCells);
  });
});
