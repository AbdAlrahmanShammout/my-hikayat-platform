import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookService } from '@/modules/book/book.service';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { CatalogSort } from '@/modules/book/enum/catalog-sort.enum';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookCatalogCoverService } from '@/modules/book-asset/book-catalog-cover.service';

import { BookReaderController } from './book.reader.controller';

function createCatalogBook(): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-08-15T00:00:00.000Z'),
    ownerId: 4,
    categories: [],
  });
}

describe('BookReaderController', () => {
  let bookReaderController: BookReaderController;
  let mockBookService: { listCatalogBooks: jest.Mock; getCatalogBookById: jest.Mock };
  let mockBookCatalogCoverService: { toBookResponses: jest.Mock };

  beforeEach(async () => {
    mockBookService = { listCatalogBooks: jest.fn(), getCatalogBookById: jest.fn() };
    mockBookCatalogCoverService = {
      toBookResponses: jest.fn(async (books: BookEntity[]) =>
        books.map((book) => new BookResponse(book, null)),
      ),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookReaderController],
      providers: [
        { provide: BookService, useValue: mockBookService },
        { provide: BookCatalogCoverService, useValue: mockBookCatalogCoverService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    bookReaderController = moduleRef.get(BookReaderController);
  });

  describe('listCatalogBooks', () => {
    it('maps category, sort, and pagination fields into the service', async () => {
      const expectedBook = createCatalogBook();
      mockBookService.listCatalogBooks.mockResolvedValue({ entities: [expectedBook], total: 1 });
      const actualResponse = await bookReaderController.listCatalogBooks({
        limit: 10,
        offset: 0,
        categoryId: 2,
        sort: CatalogSort.POPULARITY,
      });
      expect(mockBookService.listCatalogBooks).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        categoryId: 2,
        sort: CatalogSort.POPULARITY,
      });
      expect(mockBookCatalogCoverService.toBookResponses).toHaveBeenCalledWith([expectedBook]);
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.books[0].id).toBe(8);
      expect(actualResponse.books[0].publishingStatus).toBe(BookPublishingStatus.APPROVED);
      expect(actualResponse.books[0].cover).toBeNull();
    });
  });

  describe('getCatalogBook', () => {
    it('returns the published catalog book with cover enrichment', async () => {
      const expectedBook = createCatalogBook();
      mockBookService.getCatalogBookById.mockResolvedValue(expectedBook);
      mockBookCatalogCoverService.toBookResponses.mockResolvedValue([
        new BookResponse(expectedBook, {
          url: 'https://cdn.example.com/cover.jpg',
          expiresAt: new Date('2026-09-03T13:00:00.000Z'),
          contentType: 'image/jpeg',
        }),
      ]);
      const actualResponse = await bookReaderController.getCatalogBook(8);
      expect(mockBookService.getCatalogBookById).toHaveBeenCalledWith(8);
      expect(actualResponse.id).toBe(8);
      expect(actualResponse.publishedAt).toEqual(new Date('2026-08-15T00:00:00.000Z'));
      expect(actualResponse.cover?.url).toBe('https://cdn.example.com/cover.jpg');
    });
  });
});
