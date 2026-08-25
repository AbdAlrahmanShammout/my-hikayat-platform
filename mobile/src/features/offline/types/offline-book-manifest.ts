export type OfflineBookLayoutType = 'reflowable' | 'fixed_layout';

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
};
