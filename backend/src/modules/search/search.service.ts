import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { SearchCatalogBooksServiceInput } from '@/modules/search/defs/search-service.defs';

@Injectable()
export class SearchService {
  constructor(private readonly bookService: BookService) {}

  async searchCatalogBooks(input: SearchCatalogBooksServiceInput = {}): Promise<BookPage> {
    return this.bookService.listCatalogBooks({
      limit: input.limit,
      offset: input.offset,
      title: input.title,
      author: input.author,
      publisher: input.publisher,
    });
  }
}
