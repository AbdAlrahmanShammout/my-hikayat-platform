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

import { SearchReaderController } from './search.reader.controller';
import { SearchService } from './search.service';

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

describe('SearchReaderController', () => {
  let searchReaderController: SearchReaderController;
  let mockSearchService: { searchCatalogBooks: jest.Mock; searchInBook: jest.Mock };

  beforeEach(async () => {
    mockSearchService = { searchCatalogBooks: jest.fn(), searchInBook: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [SearchReaderController],
      providers: [
        { provide: SearchService, useValue: mockSearchService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    searchReaderController = moduleRef.get(SearchReaderController);
  });

  describe('searchCatalogBooks', () => {
    it('maps title, author, publisher, and pagination into the service', async () => {
      const expectedBook = createCatalogBook();
      mockSearchService.searchCatalogBooks.mockResolvedValue({
        entities: [expectedBook],
        total: 1,
      });
      const actualResponse = await searchReaderController.searchCatalogBooks({
        limit: 10,
        offset: 0,
        title: 'Lighthouse',
        author: 'Jane Author',
        publisher: 'Harbor Press',
      });
      expect(mockSearchService.searchCatalogBooks).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        title: 'Lighthouse',
        author: 'Jane Author',
        publisher: 'Harbor Press',
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.books[0].id).toBe(8);
      expect(actualResponse.books[0].title).toBe('The Last Lighthouse');
    });
  });

  describe('searchInBook', () => {
    it('maps the book id and query into the service', async () => {
      mockSearchService.searchInBook.mockResolvedValue({
        hits: [
          {
            layoutType: BookLayoutType.REFLOWABLE,
            spineIndex: 0,
            pageNumber: null,
            spreadIndex: null,
            title: 'Dawn Watch',
            excerpt: 'The Harbor lights',
            matchOffset: 4,
            highlights: [],
          },
        ],
        total: 1,
      });
      const actualResponse = await searchReaderController.searchInBook(8, {
        q: 'Harbor',
        limit: 10,
        offset: 0,
      });
      expect(mockSearchService.searchInBook).toHaveBeenCalledWith({
        bookId: 8,
        query: 'Harbor',
        limit: 10,
        offset: 0,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.hits[0].spineIndex).toBe(0);
      expect(actualResponse.hits[0].excerpt).toBe('The Harbor lights');
    });
  });
});
