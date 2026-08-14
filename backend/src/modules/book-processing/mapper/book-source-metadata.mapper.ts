import { BookSourceMetadataEntity } from '@/modules/book-processing/entity/book-source-metadata.entity';
import { BookSourceMetadataType } from '@/modules/book-processing/types/book-source-metadata-details-schema.type';

export class BookSourceMetadataMapper {
  static toEntity(schema: BookSourceMetadataType): BookSourceMetadataEntity {
    return new BookSourceMetadataEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      bookId: schema.bookId,
      packagePath: schema.packagePath,
      epubVersion: schema.epubVersion,
      identifier: schema.identifier,
      title: schema.title,
      language: schema.language,
      creator: schema.creator ?? null,
      publisher: schema.publisher ?? null,
      description: schema.description ?? null,
    });
  }
}
