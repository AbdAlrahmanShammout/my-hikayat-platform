import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { BookService } from '@/modules/book/book.service';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import {
  SearchInBookHitRecord,
  SearchInBookRecordPage,
} from '@/modules/search/defs/search-read-model-repository.defs';
import {
  InBookSearchHit,
  InBookSearchPage,
  SearchCatalogBooksServiceInput,
  SearchInBookServiceInput,
} from '@/modules/search/defs/search-service.defs';
import { InBookSearchHelper } from '@/modules/search/in-book-search.helper';
import { SearchReadModelRepository } from '@/modules/search/repository/search-read-model.repository';

@Injectable()
export class SearchService {
  constructor(
    private readonly bookService: BookService,
    private readonly searchReadModelRepository: SearchReadModelRepository,
  ) {}

  async searchCatalogBooks(input: SearchCatalogBooksServiceInput = {}): Promise<BookPage> {
    return this.bookService.listCatalogBooks({
      limit: input.limit,
      offset: input.offset,
      title: input.title,
      author: input.author,
      publisher: input.publisher,
    });
  }

  async searchInBook(input: SearchInBookServiceInput): Promise<InBookSearchPage> {
    const query: string = SearchService.normalizeSearchQuery(input.query);
    const book: BookEntity = await this.bookService.getCatalogBookById(input.bookId);
    if (
      book.layoutType !== BookLayoutType.REFLOWABLE &&
      book.layoutType !== BookLayoutType.FIXED_LAYOUT
    ) {
      return { hits: [], total: 0 };
    }
    const page: SearchInBookRecordPage = await this.searchReadModelRepository.searchInBook({
      bookId: book.id,
      query,
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      layoutType: book.layoutType,
    });
    return {
      hits: page.hits.map((hit) => SearchService.toHit(hit, query)),
      total: page.total,
    };
  }

  private static toHit(hit: SearchInBookHitRecord, query: string): InBookSearchHit {
    return {
      layoutType: hit.layoutType,
      spineIndex: hit.spineIndex,
      pageNumber: hit.pageNumber,
      spreadIndex: hit.spreadIndex,
      title: hit.title,
      excerpt: InBookSearchHelper.buildExcerpt(hit.contentText, query),
      matchOffset: InBookSearchHelper.findMatchOffset(hit.contentText, query),
      highlights: InBookSearchHelper.selectHighlightRuns(hit.runs, query),
    };
  }

  private static normalizeSearchQuery(value: string): string {
    const normalized: string = value.trim().replace(/\s+/g, ' ');
    if (normalized.length === 0) {
      throw new InvalidStateException({
        message: 'Search query must not be empty',
        code: 'SEARCH_INVALID_QUERY',
      });
    }
    return normalized;
  }
}
