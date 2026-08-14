import { ReplaceBookPageTextLayersRepoInput } from '@/modules/book-processing/defs/book-page-text-layer-repository.defs';
import { BookPageTextLayerEntity } from '@/modules/book-processing/entity/book-page-text-layer.entity';

export abstract class BookPageTextLayerRepository {
  abstract replaceByBookId(
    input: ReplaceBookPageTextLayersRepoInput,
  ): Promise<BookPageTextLayerEntity[]>;
  abstract listByBookId(bookId: number): Promise<BookPageTextLayerEntity[]>;
}
