export type OfflineBookLayoutType = 'reflowable' | 'fixed_layout';

export type OfflineReadingLeaseAccessKind = 'trial' | 'paid';

export type OfflineReadingLease = {
  readonly version: 1;
  readonly keyId: string;
  readonly userId: number;
  readonly bookId: number;
  readonly bookAssetId: number;
  readonly accessKind: OfflineReadingLeaseAccessKind;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly signature: string;
};

export type OfflineBookManifest = {
  readonly bookId: number;
  readonly bookAssetId: number;
  readonly title: string;
  readonly description: string;
  readonly layoutType: OfflineBookLayoutType;
  readonly checksumSha256: string | null;
  readonly contentType: string | null;
  readonly byteSize: number | null;
  readonly ciphertextFileName: string;
  readonly downloadedAt: string;
  readonly offlineLease: OfflineReadingLease | null;
};
