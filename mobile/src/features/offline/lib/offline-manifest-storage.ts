import { offlineFileSystem as FileSystem } from '@/native/offline-file-system';

import type {
  OfflineBookManifest,
  OfflineReadingLease,
} from '@/features/offline/types/offline-book-manifest';
import {
  ensureOfflineStorageDirectories,
  OFFLINE_MANIFEST_FILE_PATH,
} from '@/storage/offline-file-storage';

const MANIFEST_SCHEMA_VERSION = 1 as const;

type OfflineManifestDocument = {
  readonly schemaVersion: typeof MANIFEST_SCHEMA_VERSION;
  readonly packages: readonly OfflineBookManifest[];
};

/**
 * Lists all offline book manifests stored on device.
 */
export async function listOfflineManifests(): Promise<readonly OfflineBookManifest[]> {
  const document: OfflineManifestDocument = await readManifestDocument();
  return document.packages;
}

/**
 * Returns one offline manifest by book id, if downloaded.
 */
export async function getOfflineManifest(bookId: number): Promise<OfflineBookManifest | null> {
  const packages: readonly OfflineBookManifest[] = await listOfflineManifests();
  return packages.find((entry) => entry.bookId === bookId) ?? null;
}

/**
 * Returns true when an offline package exists for the book.
 */
export async function hasOfflinePackage(bookId: number): Promise<boolean> {
  const manifest: OfflineBookManifest | null = await getOfflineManifest(bookId);
  return manifest !== null;
}

/**
 * Inserts or replaces an offline manifest entry.
 */
export async function upsertOfflineManifest(manifest: OfflineBookManifest): Promise<void> {
  const document: OfflineManifestDocument = await readManifestDocument();
  const withoutBook: OfflineBookManifest[] = document.packages.filter(
    (entry) => entry.bookId !== manifest.bookId,
  );
  const nextPackages: OfflineBookManifest[] = [...withoutBook, manifest].sort(
    (left, right) => left.title.localeCompare(right.title),
  );
  await writeManifestDocument({
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    packages: nextPackages,
  });
}

/**
 * Removes an offline manifest entry without deleting ciphertext (call removeOfflineBook for full purge).
 */
export async function removeOfflineManifestEntry(bookId: number): Promise<void> {
  const document: OfflineManifestDocument = await readManifestDocument();
  const nextPackages: OfflineBookManifest[] = document.packages.filter(
    (entry) => entry.bookId !== bookId,
  );
  await writeManifestDocument({
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    packages: nextPackages,
  });
}

/**
 * Clears the manifest document entirely.
 */
export async function clearOfflineManifestDocument(): Promise<void> {
  await writeManifestDocument({
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    packages: [],
  });
}

async function readManifestDocument(): Promise<OfflineManifestDocument> {
  await ensureOfflineStorageDirectories();
  const info = await FileSystem.getInfoAsync(OFFLINE_MANIFEST_FILE_PATH);
  if (!info.exists) {
    return { schemaVersion: MANIFEST_SCHEMA_VERSION, packages: [] };
  }
  const raw: string = await FileSystem.readAsStringAsync(OFFLINE_MANIFEST_FILE_PATH);
  if (raw.trim().length === 0) {
    return { schemaVersion: MANIFEST_SCHEMA_VERSION, packages: [] };
  }
  const parsed: unknown = JSON.parse(raw) as unknown;
  return normalizeManifestDocument(parsed);
}

async function writeManifestDocument(document: OfflineManifestDocument): Promise<void> {
  await ensureOfflineStorageDirectories();
  await FileSystem.writeAsStringAsync(OFFLINE_MANIFEST_FILE_PATH, JSON.stringify(document));
}

function normalizeManifestDocument(value: unknown): OfflineManifestDocument {
  if (typeof value !== 'object' || value === null) {
    return { schemaVersion: MANIFEST_SCHEMA_VERSION, packages: [] };
  }
  const record = value as Record<string, unknown>;
  const packagesRaw: unknown = record.packages;
  if (!Array.isArray(packagesRaw)) {
    return { schemaVersion: MANIFEST_SCHEMA_VERSION, packages: [] };
  }
  const packages: OfflineBookManifest[] = packagesRaw
    .map((entry) => normalizeManifestEntry(entry))
    .filter((entry): entry is OfflineBookManifest => entry !== null);
  return { schemaVersion: MANIFEST_SCHEMA_VERSION, packages };
}

function normalizeManifestEntry(value: unknown): OfflineBookManifest | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const bookId: number | null = coercePositiveInt(record.bookId);
  const bookAssetId: number | null = coercePositiveInt(record.bookAssetId);
  const title: string = coerceString(record.title);
  const layoutType: OfflineBookManifest['layoutType'] | null = coerceLayoutType(record.layoutType);
  const ciphertextFileName: string = coerceString(record.ciphertextFileName);
  const downloadedAt: string = coerceString(record.downloadedAt);
  if (
    bookId === null ||
    bookAssetId === null ||
    title.length === 0 ||
    layoutType === null ||
    ciphertextFileName.length === 0 ||
    downloadedAt.length === 0
  ) {
    return null;
  }
  return {
    bookId,
    bookAssetId,
    title,
    description: coerceString(record.description),
    layoutType,
    checksumSha256: coerceNullableString(record.checksumSha256),
    contentType: coerceNullableString(record.contentType),
    byteSize: coerceNullablePositiveInt(record.byteSize),
    ciphertextFileName,
    downloadedAt,
    offlineLease: normalizeOfflineReadingLease(record.offlineLease, bookId, bookAssetId),
  };
}

function normalizeOfflineReadingLease(
  value: unknown,
  bookId: number,
  bookAssetId: number,
): OfflineReadingLease | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    record.version !== 1 ||
    record.userId === undefined ||
    record.bookId !== bookId ||
    record.bookAssetId !== bookAssetId
  ) {
    return null;
  }
  const userId: number | null = coercePositiveInt(record.userId);
  const accessKind: OfflineReadingLease['accessKind'] | null = coerceLeaseAccessKind(
    record.accessKind,
  );
  const keyId: string = coerceString(record.keyId);
  const issuedAt: string = coerceString(record.issuedAt);
  const expiresAt: string = coerceString(record.expiresAt);
  const signature: string = coerceString(record.signature);
  if (
    userId === null ||
    accessKind === null ||
    keyId.length === 0 ||
    issuedAt.length === 0 ||
    expiresAt.length === 0 ||
    signature.length === 0
  ) {
    return null;
  }
  return {
    version: 1,
    keyId,
    userId,
    bookId,
    bookAssetId,
    accessKind,
    issuedAt,
    expiresAt,
    signature,
  };
}

function coercePositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
    return null;
  }
  return Math.floor(value);
}

function coerceNullablePositiveInt(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return coercePositiveInt(value);
}

function coerceString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function coerceNullableString(value: unknown): string | null {
  const text: string = coerceString(value);
  if (text.length === 0) {
    return null;
  }
  return text;
}

function coerceLayoutType(value: unknown): OfflineBookManifest['layoutType'] | null {
  if (value === 'reflowable' || value === 'fixed_layout') {
    return value;
  }
  return null;
}

function coerceLeaseAccessKind(value: unknown): OfflineReadingLease['accessKind'] | null {
  if (value === 'trial' || value === 'paid') {
    return value;
  }
  return null;
}
