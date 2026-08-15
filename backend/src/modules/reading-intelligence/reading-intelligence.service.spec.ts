import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionService } from '@/modules/reading/reading-session.service';

import { ReadingIntelligenceService } from './reading-intelligence.service';

function createOpenSession(): ReadingSessionEntity {
  return new ReadingSessionEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 7,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    startedAt: new Date('2026-01-01T01:00:00.000Z'),
    endedAt: null,
    activeDurationMs: 0,
    idleDurationMs: 0,
    spineIndex: 1,
    scrollOffset: 120,
    spreadIndex: null,
    pageNumber: null,
  });
}

describe('ReadingIntelligenceService', () => {
  let mockReadingSessionService: {
    startReadingSession: jest.Mock;
    recordReadingSessionActivity: jest.Mock;
    endReadingSession: jest.Mock;
    getOpenReadingSessionByUserAndBook: jest.Mock;
  };
  let readingIntelligenceService: ReadingIntelligenceService;

  beforeEach(() => {
    mockReadingSessionService = {
      startReadingSession: jest.fn(),
      recordReadingSessionActivity: jest.fn(),
      endReadingSession: jest.fn(),
      getOpenReadingSessionByUserAndBook: jest.fn(),
    };
    readingIntelligenceService = new ReadingIntelligenceService(
      mockReadingSessionService as unknown as ReadingSessionService,
    );
  });

  it('starts a session through the reading session service', async () => {
    const expectedSession = createOpenSession();
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
    const expectedSession = createOpenSession();
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
});
