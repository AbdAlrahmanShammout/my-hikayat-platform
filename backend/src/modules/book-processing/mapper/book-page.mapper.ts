import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { BookPageType } from '@/modules/book-processing/types/book-page-details-schema.type';

export class BookPageMapper {
  static toEntity(schema: BookPageType): BookPageEntity {
    return new BookPageEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      bookId: schema.bookId,
      spineIndex: schema.spineIndex,
      href: schema.href,
      manifestId: schema.manifestId,
      title: schema.title,
      width: schema.width,
      height: schema.height,
      spreadRole: schema.spreadRole as BookPageSpreadRole,
    });
  }
}
