import { Platform } from 'react-native';

import { offlineFileSystem as FileSystem } from '@/native/offline-file-system';
import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import type { BookAssetContentKey } from '@/features/reader/api/create-content-key';
import { createBookAssetContentKey } from '@/features/reader/api/create-content-key';
import {
  decodeContentKeyBase64,
  decryptContentWithDataKey,
  verifyCiphertextChecksum,
} from '@/features/reader/lib/decrypt-content-with-data-key';

export type BookOpenProgress =
  | {
      readonly phase: 'downloading';
      readonly loadedBytes: number;
      readonly totalBytes: number | null;
    }
  | { readonly phase: 'preparing' };

export type DownloadAndDecryptBookSourceInput = {
  readonly bookId: number;
  readonly sessionId: number;
  readonly deliveryGrant: BookAssetDeliveryGrant;
  readonly onProgress?: (progress: BookOpenProgress) => void;
};

/**
 * Downloads an encrypted source, verifies checksum, decrypts in memory, and zeros the DEK.
 */
export async function downloadAndDecryptBookSource(
  input: DownloadAndDecryptBookSourceInput,
): Promise<Uint8Array> {
  const ciphertext: Uint8Array = await downloadEncryptedBytes({
    url: input.deliveryGrant.url,
    expectedByteSize: readPositiveByteSize(input.deliveryGrant.byteSize),
    onProgress: input.onProgress,
  });
  verifyCiphertextChecksum(ciphertext, coerceChecksum(input.deliveryGrant.checksumSha256));
  input.onProgress?.({ phase: 'preparing' });
  const contentKeyResponse: BookAssetContentKey = await createBookAssetContentKey({
    bookId: input.bookId,
    sessionId: input.sessionId,
  });
  if (contentKeyResponse.keyDelivery !== 'plain') {
    throw new Error('This content key format is not supported yet.');
  }
  if (contentKeyResponse.algorithm !== 'aes-256-gcm') {
    throw new Error('This content encryption algorithm is not supported.');
  }
  let dataKey: Uint8Array | null = decodeContentKeyBase64(contentKeyResponse.key);
  try {
    return decryptContentWithDataKey({
      ciphertext,
      dataKey,
    });
  } finally {
    if (dataKey !== null) {
      dataKey.fill(0);
      dataKey = null;
    }
  }
}

type DownloadEncryptedBytesInput = {
  readonly url: string;
  readonly expectedByteSize: number | null;
  readonly onProgress?: (progress: BookOpenProgress) => void;
};

async function downloadEncryptedBytes(input: DownloadEncryptedBytesInput): Promise<Uint8Array> {
  const directory: string | null = resolveDownloadDirectory();
  if (Platform.OS === 'web' || directory === null) {
    return downloadEncryptedBytesWithXhr(input);
  }
  return downloadEncryptedBytesToCache(input, directory);
}

async function downloadEncryptedBytesToCache(
  input: DownloadEncryptedBytesInput,
  directory: string,
): Promise<Uint8Array> {
  const targetPath: string = `${directory}reader-open-${Date.now()}.bin`;
  reportDownloadProgress(input, 0, input.expectedByteSize);
  try {
    const download = FileSystem.createDownloadResumable(
      input.url,
      targetPath,
      {},
      (progress) => {
        reportDownloadProgress(
          input,
          progress.totalBytesWritten,
          resolveWrittenTotal(progress.totalBytesExpectedToWrite, input.expectedByteSize),
        );
      },
    );
    const result = await download.downloadAsync();
    if (result === undefined || result.status < 200 || result.status >= 300) {
      throw new Error('Could not download the book file.');
    }
    const base64: string = await FileSystem.readAsStringAsync(targetPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return decodeBase64ToBytes(base64);
  } finally {
    await deleteTempDownload(targetPath);
  }
}

function downloadEncryptedBytesWithXhr(input: DownloadEncryptedBytesInput): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    reportDownloadProgress(input, 0, input.expectedByteSize);
    const request = new XMLHttpRequest();
    request.open('GET', input.url);
    request.responseType = 'arraybuffer';
    request.onprogress = (event: ProgressEvent): void => {
      reportDownloadProgress(
        input,
        event.loaded,
        resolveDownloadTotalBytes(event, input.expectedByteSize),
      );
    };
    request.onload = (): void => {
      if (request.status < 200 || request.status >= 300 || !(request.response instanceof ArrayBuffer)) {
        reject(new Error('Could not download the book file.'));
        return;
      }
      resolve(new Uint8Array(request.response));
    };
    request.onerror = (): void => {
      reject(new Error('Could not download the book file.'));
    };
    request.send();
  });
}

function reportDownloadProgress(
  input: DownloadEncryptedBytesInput,
  loadedBytes: number,
  totalBytes: number | null,
): void {
  input.onProgress?.({
    phase: 'downloading',
    loadedBytes,
    totalBytes,
  });
}

function resolveDownloadDirectory(): string | null {
  const directory: string | null = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (directory === null || directory.length === 0) {
    return null;
  }
  return directory;
}

function resolveWrittenTotal(expectedToWrite: number, grantByteSize: number | null): number | null {
  if (expectedToWrite > 0) {
    return expectedToWrite;
  }
  return grantByteSize;
}

async function deleteTempDownload(targetPath: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(targetPath, { idempotent: true });
  } catch {
    return;
  }
}

function decodeBase64ToBytes(base64: string): Uint8Array {
  const normalized: string = base64.replace(/\s/g, '');
  if (normalized.length === 0) {
    return new Uint8Array(0);
  }
  const binary: string = globalThis.atob(normalized);
  const bytes: Uint8Array = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function resolveDownloadTotalBytes(event: ProgressEvent, expectedByteSize: number | null): number | null {
  if (event.lengthComputable && event.total > 0) {
    return event.total;
  }
  return expectedByteSize;
}

export function createInitialDownloadProgress(byteSize: unknown): BookOpenProgress | null {
  const totalBytes: number | null = readPositiveByteSize(byteSize);
  if (totalBytes === null) {
    return null;
  }
  return {
    phase: 'downloading',
    loadedBytes: 0,
    totalBytes,
  };
}

function readPositiveByteSize(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

function coerceChecksum(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  return value;
}
