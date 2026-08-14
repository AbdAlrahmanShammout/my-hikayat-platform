import { BookPageTextLayerEntity } from '@/modules/book-processing/entity/book-page-text-layer.entity';
import { BookPageTextRunMapper } from '@/modules/book-processing/mapper/book-page-text-run.mapper';
import { BookPageTextLayerType } from '@/modules/book-processing/types/book-page-text-layer-details-schema.type';
import { BookPageTextRunType } from '@/modules/book-processing/types/book-page-text-run-details-schema.type';

type BookPageTextLayerRow = BookPageTextLayerType & {
  readonly runs?: readonly BookPageTextRunType[];
};

export class BookPageTextLayerMapper {
  static toEntity(schema: BookPageTextLayerRow): BookPageTextLayerEntity {
    return new BookPageTextLayerEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      pageId: schema.pageId,
      bookId: schema.bookId,
      contentText: schema.contentText,
      runs: schema.runs?.map((run) => BookPageTextRunMapper.toEntity(run)),
    });
  }
}
