import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';

export type CreateBookAssetServiceInput = {
  readonly bookId: number;
  readonly kind: BookAssetKind;
  readonly storageKey: string;
  readonly contentType: string;
  readonly byteSize: number;
  readonly checksumSha256?: string | null;
  readonly originalFileName?: string | null;
  readonly sortOrder?: number;
  readonly isEncrypted?: boolean;
};

export type UpdateBookAssetServiceInput = {
  readonly id: number;
  readonly storageKey?: string;
  readonly contentType?: string;
  readonly byteSize?: number;
  readonly checksumSha256?: string | null;
  readonly originalFileName?: string | null;
  readonly sortOrder?: number;
  readonly isEncrypted?: boolean;
};

export type ListBookAssetsServiceInput = {
  readonly bookId: number;
  readonly limit?: number;
  readonly offset?: number;
  readonly kind?: BookAssetKind;
};
