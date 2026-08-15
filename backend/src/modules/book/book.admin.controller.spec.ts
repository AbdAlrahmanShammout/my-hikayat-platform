import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookPublishingStatusService } from '@/modules/book/book-publishing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { BookAdminController } from './book.admin.controller';

function createSampleAdmin(): UserEntity {
  return new UserEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.ADMIN,
    isPublisher: false,
  });
}

function createSampleBook(publishingStatus = BookPublishingStatus.IN_REVIEW): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus,
    processingStatus: BookProcessingStatus.READY,
    publishedAt:
      publishingStatus === BookPublishingStatus.APPROVED
        ? new Date('2026-08-15T00:00:00.000Z')
        : null,
    ownerId: 4,
    categories: [],
  });
}

describe('BookAdminController', () => {
  let bookAdminController: BookAdminController;
  let mockBookService: { listBooks: jest.Mock; getBookById: jest.Mock };
  let mockBookPublishingStatusService: { approveBook: jest.Mock; rejectBook: jest.Mock };

  beforeEach(async () => {
    mockBookService = { listBooks: jest.fn(), getBookById: jest.fn() };
    mockBookPublishingStatusService = { approveBook: jest.fn(), rejectBook: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookAdminController],
      providers: [
        { provide: BookService, useValue: mockBookService },
        { provide: BookPublishingStatusService, useValue: mockBookPublishingStatusService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    bookAdminController = moduleRef.get(BookAdminController);
  });

  describe('listBooksForReview', () => {
    it('lists in-review books with pagination fields from the query', async () => {
      const expectedBook = createSampleBook();
      mockBookService.listBooks.mockResolvedValue({ entities: [expectedBook], total: 1 });
      const actualResponse = await bookAdminController.listBooksForReview({
        limit: 10,
        offset: 0,
      });
      expect(mockBookService.listBooks).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        publishingStatus: BookPublishingStatus.IN_REVIEW,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.books[0].id).toBe(8);
      expect(actualResponse.books[0].publishingStatus).toBe(BookPublishingStatus.IN_REVIEW);
    });
  });

  describe('getBook', () => {
    it('returns the requested book', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      const actualResponse = await bookAdminController.getBook(8);
      expect(mockBookService.getBookById).toHaveBeenCalledWith(8);
      expect(actualResponse.id).toBe(8);
    });
  });

  describe('approveBook', () => {
    it('approves through the publishing status service', async () => {
      mockBookPublishingStatusService.approveBook.mockResolvedValue(
        createSampleBook(BookPublishingStatus.APPROVED),
      );
      const actualResponse = await bookAdminController.approveBook(8, createSampleAdmin());
      expect(mockBookPublishingStatusService.approveBook).toHaveBeenCalledWith({
        bookId: 8,
        actorUserId: 9,
      });
      expect(actualResponse.publishingStatus).toBe(BookPublishingStatus.APPROVED);
      expect(actualResponse.publishedAt).toEqual(new Date('2026-08-15T00:00:00.000Z'));
    });
  });

  describe('rejectBook', () => {
    it('rejects through the publishing status service', async () => {
      mockBookPublishingStatusService.rejectBook.mockResolvedValue(
        createSampleBook(BookPublishingStatus.REJECTED),
      );
      const actualResponse = await bookAdminController.rejectBook(8, createSampleAdmin());
      expect(mockBookPublishingStatusService.rejectBook).toHaveBeenCalledWith({
        bookId: 8,
        actorUserId: 9,
      });
      expect(actualResponse.publishingStatus).toBe(BookPublishingStatus.REJECTED);
      expect(actualResponse.publishedAt).toBeNull();
    });
  });
});
