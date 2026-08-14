import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';

export type CreateBookAssetRepoInput = {
  readonly bookId: number;
  readonly kind: BookAssetKind;
  readonly storageKey: string;
  readonly contentType: string;
  readonly byteSize: number;
  readonly checksumSha256: string | null;
  readonly originalFileName: string | null;
  readonly sortOrder: number;
  readonly isEncrypted: boolean;
};

export type UpdateBookAssetRepoInput = {
  readonly id: number;
  readonly storageKey?: string;
  readonly contentType?: string;
  readonly byteSize?: number;
  readonly checksumSha256?: string | null;
  readonly originalFileName?: string | null;
  readonly sortOrder?: number;
  readonly isEncrypted?: boolean;
};

export type ListBookAssetsRepoInput = {
  readonly bookId: number;
  readonly limit: number;
  readonly offset: number;
  readonly kind?: BookAssetKind;
};

export type BookAssetPage = {
  readonly entities: BookAssetEntity[];
  readonly total: number;
};
