import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookService } from '@/modules/book/book.service';
import { CreateBookRequestDto } from '@/modules/book/dto/request/create-book-request.dto';
import { UpdateBookRequestDto } from '@/modules/book/dto/request/update-book-request.dto';
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
    publishingStatus: BookPublishingStatus.PENDING,
    processingStatus: BookProcessingStatus.NOT_STARTED,
    publishedAt: null,
    ownerId: 4,
    categories: [],
  });
}

describe('BookAuthorController', () => {
  let bookAuthorController: BookAuthorController;
  let mockBookService: {
    createBook: jest.Mock;
    listBooks: jest.Mock;
    getManagedBook: jest.Mock;
    updateBook: jest.Mock;
  };
  let mockBookProcessingOrchestrationService: { submitForReview: jest.Mock };

  beforeEach(async () => {
    mockBookService = {
      createBook: jest.fn(),
      listBooks: jest.fn(),
      getManagedBook: jest.fn(),
      updateBook: jest.fn(),
    };
    mockBookProcessingOrchestrationService = { submitForReview: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookAuthorController],
      providers: [
        { provide: BookService, useValue: mockBookService },
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

  describe('createBook', () => {
    it('creates a book owned by the authenticated publisher', async () => {
      const expectedBook = createSampleBook();
      mockBookService.createBook.mockResolvedValue(expectedBook);
      const dto: CreateBookRequestDto = {
        title: 'The Last Lighthouse',
        description: 'A reflowable chapter book.',
        bookType: BookType.STANDARD_CHAPTER,
        categoryIds: [2],
      };
      const actualResponse = await bookAuthorController.createBook(dto, createSampleAuthor());
      expect(mockBookService.createBook).toHaveBeenCalledWith({
        title: 'The Last Lighthouse',
        description: 'A reflowable chapter book.',
        bookType: BookType.STANDARD_CHAPTER,
        ownerId: 4,
        categoryIds: [2],
      });
      expect(actualResponse.id).toBe(8);
      expect(actualResponse.ownerId).toBe(4);
    });
  });

  describe('listOwnedBooks', () => {
    it('lists books for the authenticated owner', async () => {
      const expectedBook = createSampleBook();
      mockBookService.listBooks.mockResolvedValue({ entities: [expectedBook], total: 1 });
      const actualResponse = await bookAuthorController.listOwnedBooks(
        { limit: 10, offset: 0 },
        createSampleAuthor(),
      );
      expect(mockBookService.listBooks).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        ownerId: 4,
        publishingStatus: undefined,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.books[0].id).toBe(8);
    });
  });

  describe('getOwnedBook', () => {
    it('loads a managed book for the authenticated publisher', async () => {
      const expectedBook = createSampleBook();
      mockBookService.getManagedBook.mockResolvedValue(expectedBook);
      const actualResponse = await bookAuthorController.getOwnedBook(8, createSampleAuthor());
      expect(mockBookService.getManagedBook).toHaveBeenCalledWith({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
      });
      expect(actualResponse.id).toBe(8);
    });
  });

  describe('updateOwnedBook', () => {
    it('updates metadata after confirming ownership', async () => {
      const expectedBook = createSampleBook();
      mockBookService.getManagedBook.mockResolvedValue(expectedBook);
      mockBookService.updateBook.mockResolvedValue(expectedBook);
      const dto: UpdateBookRequestDto = { title: 'Harbor Lights' };
      const actualResponse = await bookAuthorController.updateOwnedBook(
        8,
        dto,
        createSampleAuthor(),
      );
      expect(mockBookService.getManagedBook).toHaveBeenCalledWith({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
      });
      expect(mockBookService.updateBook).toHaveBeenCalledWith({
        id: 8,
        title: 'Harbor Lights',
        description: undefined,
        bookType: undefined,
        categoryIds: undefined,
      });
      expect(actualResponse.id).toBe(8);
    });
  });

  describe('submitForReview', () => {
    it('maps the book id and principal into the orchestration service', async () => {
      const expectedBook = new BookEntity({
        ...createSampleBook(),
        publishingStatus: BookPublishingStatus.IN_REVIEW,
        processingStatus: BookProcessingStatus.READY,
      });
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
