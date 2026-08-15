import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';

import { SearchService } from './search.service';

function createCatalogBook(
  layoutType: BookLayoutType | null = BookLayoutType.REFLOWABLE,
): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-08-15T00:00:00.000Z'),
    ownerId: 4,
    categories: [],
  });
}

describe('SearchService', () => {
  let mockBookService: { listCatalogBooks: jest.Mock; getCatalogBookById: jest.Mock };
  let mockSearchReadModelRepository: { searchInBook: jest.Mock };
  let searchService: SearchService;

  beforeEach(() => {
    mockBookService = { listCatalogBooks: jest.fn(), getCatalogBookById: jest.fn() };
    mockSearchReadModelRepository = { searchInBook: jest.fn() };
    searchService = new SearchService(
      mockBookService as unknown as BookService,
      mockSearchReadModelRepository,
    );
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

  describe('searchInBook', () => {
    it('maps reflowable chapter hits into excerpts', async () => {
      mockBookService.getCatalogBookById.mockResolvedValue(createCatalogBook());
      mockSearchReadModelRepository.searchInBook.mockResolvedValue({
        hits: [
          {
            layoutType: BookLayoutType.REFLOWABLE,
            spineIndex: 0,
            pageNumber: null,
            spreadIndex: null,
            title: 'Dawn Watch',
            contentText: 'The Harbor lights',
            runs: [],
          },
        ],
        total: 1,
      });
      const actualPage = await searchService.searchInBook({ bookId: 8, query: '  Harbor  ' });
      expect(mockSearchReadModelRepository.searchInBook).toHaveBeenCalledWith({
        bookId: 8,
        query: 'Harbor',
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        layoutType: BookLayoutType.REFLOWABLE,
      });
      expect(actualPage.total).toBe(1);
      expect(actualPage.hits[0].excerpt).toContain('Harbor');
      expect(actualPage.hits[0].matchOffset).toBe(4);
      expect(actualPage.hits[0].spineIndex).toBe(0);
    });

    it('maps fixed-layout hits with highlight runs', async () => {
      mockBookService.getCatalogBookById.mockResolvedValue(
        createCatalogBook(BookLayoutType.FIXED_LAYOUT),
      );
      mockSearchReadModelRepository.searchInBook.mockResolvedValue({
        hits: [
          {
            layoutType: BookLayoutType.FIXED_LAYOUT,
            spineIndex: 0,
            pageNumber: 1,
            spreadIndex: 0,
            title: 'Left Page',
            contentText: 'Harbor lights',
            runs: [{ text: 'Harbor', x: 120, y: 80, width: 80, height: 20 }],
          },
        ],
        total: 1,
      });
      const actualPage = await searchService.searchInBook({ bookId: 8, query: 'Harbor' });
      expect(actualPage.hits[0].pageNumber).toBe(1);
      expect(actualPage.hits[0].spreadIndex).toBe(0);
      expect(actualPage.hits[0].highlights).toEqual([
        { text: 'Harbor', x: 120, y: 80, width: 80, height: 20 },
      ]);
    });

    it('hides unpublished books as not found', async () => {
      mockBookService.getCatalogBookById.mockRejectedValue(
        new ResourceNotFoundException('Book', 8),
      );
      await expect(
        searchService.searchInBook({ bookId: 8, query: 'Harbor' }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockSearchReadModelRepository.searchInBook).not.toHaveBeenCalled();
    });
  });
});
