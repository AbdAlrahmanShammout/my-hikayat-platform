import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';

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

describe('SearchService', () => {
  let mockBookService: { listCatalogBooks: jest.Mock };
  let searchService: SearchService;

  beforeEach(() => {
    mockBookService = { listCatalogBooks: jest.fn() };
    searchService = new SearchService(mockBookService as unknown as BookService);
  });

  describe('searchCatalogBooks', () => {
    it('forwards title, author, and publisher filters to the catalog list', async () => {
      const expectedBook = createCatalogBook();
      mockBookService.listCatalogBooks.mockResolvedValue({ entities: [expectedBook], total: 1 });
      const actualPage = await searchService.searchCatalogBooks({
        limit: 10,
        offset: 0,
        title: 'Lighthouse',
        author: 'Jane Author',
        publisher: 'Harbor Press',
      });
      expect(mockBookService.listCatalogBooks).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        title: 'Lighthouse',
        author: 'Jane Author',
        publisher: 'Harbor Press',
      });
      expect(actualPage.total).toBe(1);
      expect(actualPage.entities[0]).toBe(expectedBook);
    });
  });
});
