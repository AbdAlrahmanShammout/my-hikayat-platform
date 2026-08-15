import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { ReadingIntelligenceReaderController } from './reading-intelligence.reader.controller';
import { ReadingIntelligenceService } from './reading-intelligence.service';

function createSampleReader(): UserEntity {
  return new UserEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

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
    activeDurationMs: 15000,
    idleDurationMs: 3000,
    spineIndex: 2,
    scrollOffset: 400,
    spreadIndex: null,
    pageNumber: null,
  });
}

describe('ReadingIntelligenceReaderController', () => {
  let readingIntelligenceReaderController: ReadingIntelligenceReaderController;
  let mockReadingIntelligenceService: {
    startReadingSession: jest.Mock;
    ingestReadingActivity: jest.Mock;
    endReadingSession: jest.Mock;
    getCurrentReadingSession: jest.Mock;
  };

  beforeEach(async () => {
    mockReadingIntelligenceService = {
      startReadingSession: jest.fn(),
      ingestReadingActivity: jest.fn(),
      endReadingSession: jest.fn(),
      getCurrentReadingSession: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ReadingIntelligenceReaderController],
      providers: [
        { provide: ReadingIntelligenceService, useValue: mockReadingIntelligenceService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    readingIntelligenceReaderController = moduleRef.get(ReadingIntelligenceReaderController);
  });

  describe('ingestReadingActivity', () => {
    it('maps book id, session id, principal, and interval fields into the service', async () => {
      const expectedSession = createOpenSession();
      mockReadingIntelligenceService.ingestReadingActivity.mockResolvedValue(expectedSession);
      const actualResponse = await readingIntelligenceReaderController.ingestReadingActivity(
        8,
        9,
        { activeDurationMs: 15000, idleDurationMs: 3000, spineIndex: 2, scrollOffset: 400 },
        createSampleReader(),
      );
      expect(mockReadingIntelligenceService.ingestReadingActivity).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        sessionId: 9,
        activeDurationMs: 15000,
        idleDurationMs: 3000,
        spineIndex: 2,
        scrollOffset: 400,
        spreadIndex: undefined,
        pageNumber: undefined,
      });
      expect(actualResponse.id).toBe(9);
      expect(actualResponse.activeDurationMs).toBe(15000);
      expect(actualResponse.idleDurationMs).toBe(3000);
    });
  });
});
