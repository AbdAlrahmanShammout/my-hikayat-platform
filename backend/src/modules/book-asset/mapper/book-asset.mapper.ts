import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetType } from '@/modules/book-asset/types/book-asset-details-schema.type';

export class BookAssetMapper {
  static toEntity(schema: BookAssetType): BookAssetEntity {
    return new BookAssetEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      bookId: schema.bookId,
      kind: schema.kind as BookAssetKind,
      storageKey: schema.storageKey,
      contentType: schema.contentType,
      byteSize: schema.byteSize,
      checksumSha256: schema.checksumSha256,
      originalFileName: schema.originalFileName,
      sortOrder: schema.sortOrder,
      isEncrypted: schema.isEncrypted,
    });
  }
}
