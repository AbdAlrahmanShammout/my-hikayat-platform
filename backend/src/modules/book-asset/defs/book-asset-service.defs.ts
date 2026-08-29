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
  readonly wrappedContentKey?: Buffer | null;
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
  readonly wrappedContentKey?: Buffer | null;
};

export type ListBookAssetsServiceInput = {
  readonly bookId: number;
  readonly limit?: number;
  readonly offset?: number;
  readonly kind?: BookAssetKind;
};

export type FindLatestBookAssetServiceInput = {
  readonly bookId: number;
  readonly kind: BookAssetKind;
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

export type CreateBookAssetDeliveryGrantServiceInput = {
  readonly bookId: number;
  readonly userId: number;
};

export type BookAssetDeliveryGrant = {
  readonly bookId: number;
  readonly bookAssetId: number;
  readonly kind: BookAssetKind;
  readonly url: string;
  readonly expiresAt: Date;
  readonly contentType: string;
  readonly byteSize: number;
  readonly checksumSha256: string | null;
  readonly isEncrypted: boolean;
};

export type OfflineReadingLeaseAccessKind = 'trial' | 'paid';

export type OfflineReadingLease = {
  readonly version: 1;
  readonly keyId: string;
  readonly userId: number;
  readonly bookId: number;
  readonly bookAssetId: number;
  readonly accessKind: OfflineReadingLeaseAccessKind;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly signature: string;
};

export type CreateBookAssetContentKeyServiceInput = {
  readonly bookId: number;
  readonly userId: number;
  readonly sessionId: number;
};

export type BookAssetContentKey = {
  readonly bookId: number;
  readonly bookAssetId: number;
  readonly sessionId: number;
  readonly keyId: string;
  readonly algorithm: 'aes-256-gcm';
  readonly keyDelivery: 'plain';
  readonly key: string;
  readonly expiresAt: Date;
  readonly offlineLease: OfflineReadingLease;
};
