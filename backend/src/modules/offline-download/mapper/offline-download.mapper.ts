import { OfflineDownloadEntity } from '@/modules/offline-download/entity/offline-download.entity';
import { OfflineDownloadType } from '@/modules/offline-download/types/offline-download-details-schema.type';

export class OfflineDownloadMapper {
  static toEntity(schema: OfflineDownloadType): OfflineDownloadEntity {
    return new OfflineDownloadEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      userId: schema.userId,
      bookId: schema.bookId,
    });
  }
}
