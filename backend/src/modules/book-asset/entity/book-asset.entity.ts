import { BaseEntity } from '@/common/base/base.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { BookAssetZodType } from '@/modules/book-asset/zod/book-asset.zod';

export class BookAssetEntity extends BaseEntity {
  bookId!: number;
  kind!: BookAssetKind;
  storageKey!: string;
  contentType!: string;
  byteSize!: number;
  checksumSha256!: string | null;
  originalFileName!: string | null;
  sortOrder!: number;
  isEncrypted!: boolean;
  wrappedContentKey!: Buffer | null;

  constructor(data: BookAssetZodType) {
    super();
    Object.assign(this, data);
    if (this.wrappedContentKey === undefined) {
      this.wrappedContentKey = null;
    }
  }
}
