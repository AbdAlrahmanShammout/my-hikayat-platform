import { BaseEntity } from '@/common/base/base.entity';
import { OfflineDownloadZodType } from '@/modules/offline-download/zod/offline-download.zod';

export class OfflineDownloadEntity extends BaseEntity {
  userId!: number;
  bookId!: number;

  constructor(data: OfflineDownloadZodType) {
    super();
    Object.assign(this, data);
  }
}
