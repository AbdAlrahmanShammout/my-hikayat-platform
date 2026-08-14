import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookProcessingOrchestrationService } from '@/modules/book-processing/book-processing-orchestration.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { BookAuthorController } from './book.author.controller';

function createSampleAuthor(): UserEntity {
  return new UserEntity({
    id: 4,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'author@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.AUTHOR,
    isPublisher: true,
  });
}

function createSampleBook(): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.IN_REVIEW,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: null,
    ownerId: 4,
    categories: [],
  });
}

describe('BookAuthorController', () => {
  let bookAuthorController: BookAuthorController;
  let mockBookProcessingOrchestrationService: { submitForReview: jest.Mock };

  beforeEach(async () => {
    mockBookProcessingOrchestrationService = { submitForReview: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookAuthorController],
      providers: [
        {
          provide: BookProcessingOrchestrationService,
          useValue: mockBookProcessingOrchestrationService,
        },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    bookAuthorController = moduleRef.get(BookAuthorController);
  });

  describe('submitForReview', () => {
    it('maps the book id and principal into the orchestration service', async () => {
      const expectedBook = createSampleBook();
      mockBookProcessingOrchestrationService.submitForReview.mockResolvedValue(expectedBook);
      const actualResponse = await bookAuthorController.submitForReview(8, createSampleAuthor());
      expect(mockBookProcessingOrchestrationService.submitForReview).toHaveBeenCalledWith({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
      });
      expect(actualResponse.id).toBe(8);
      expect(actualResponse.publishingStatus).toBe(BookPublishingStatus.IN_REVIEW);
      expect(actualResponse.processingStatus).toBe(BookProcessingStatus.READY);
    });
  });
});
