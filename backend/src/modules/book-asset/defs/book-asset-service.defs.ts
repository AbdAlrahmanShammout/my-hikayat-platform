import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { UserRole } from '@/modules/user/enum/general.enum';

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

export type UploadBookSourceServiceInput = {
  readonly bookId: number;
  readonly actorId: number;
  readonly actorRole: UserRole;
  readonly body: Buffer;
  readonly contentType: string;
  readonly originalFileName?: string | null;
};

export type UploadedSourceFile = {
  readonly buffer: Buffer;
  readonly mimetype: string;
  readonly originalname: string;
};

export type UploadBookCatalogMediaServiceInput = {
  readonly bookId: number;
  readonly actorId: number;
  readonly actorRole: UserRole;
  readonly body: Buffer;
  readonly contentType: string;
  readonly originalFileName?: string | null;
};
