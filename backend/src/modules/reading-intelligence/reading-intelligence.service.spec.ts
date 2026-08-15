import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';
import { ReadingVisualEngagementNotFixedLayoutException } from '@/modules/reading-intelligence/exceptions/reading-visual-engagement-not-fixed-layout.exception';
import { ReadingVisualEngagementService } from '@/modules/reading-intelligence/reading-visual-engagement.service';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';

import { ReadingIntelligenceService } from './reading-intelligence.service';

function createOpenSession(layoutType: BookLayoutType): ReadingSessionEntity {
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
    spineIndex: layoutType === BookLayoutType.REFLOWABLE ? 1 : null,
    scrollOffset: layoutType === BookLayoutType.REFLOWABLE ? 120 : null,
    spreadIndex: layoutType === BookLayoutType.FIXED_LAYOUT ? 1 : null,
    pageNumber: layoutType === BookLayoutType.FIXED_LAYOUT ? 3 : null,
  });
}

function createSampleEngagement(): ReadingVisualEngagementEntity {
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
  };
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
    };
    readingIntelligenceService = new ReadingIntelligenceService(
      mockReadingSessionService as unknown as ReadingSessionService,
      mockReadingVisualEngagementService as unknown as ReadingVisualEngagementService,
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

  it('ingests an active vs idle interval onto the open session', async () => {
    const expectedSession = createOpenSession(BookLayoutType.REFLOWABLE);
    mockReadingSessionService.recordReadingSessionActivity.mockResolvedValue(expectedSession);
    const actualSession = await readingIntelligenceService.ingestReadingActivity({
      userId: 7,
      bookId: 8,
      sessionId: 9,
      activeDurationMs: 15000,
      idleDurationMs: 3000,
      spineIndex: 2,
      scrollOffset: 400,
    });
    expect(mockReadingSessionService.recordReadingSessionActivity).toHaveBeenCalledWith({
      id: 9,
      userId: 7,
      bookId: 8,
      activeDurationMs: 15000,
      idleDurationMs: 3000,
      spineIndex: 2,
      scrollOffset: 400,
      spreadIndex: undefined,
      pageNumber: undefined,
    });
    expect(actualSession).toBe(expectedSession);
  });

  it('ingests visual engagement for an open fixed-layout session', async () => {
    const expectedEngagement = createSampleEngagement();
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
});
