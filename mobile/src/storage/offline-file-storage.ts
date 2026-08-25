import { offlineFileSystem as FileSystem } from '@/native/offline-file-system';

export const OFFLINE_ROOT_DIRECTORY = `${FileSystem.documentDirectory ?? ''}offline/`;
export const OFFLINE_CIPHERTEXT_DIRECTORY = `${OFFLINE_ROOT_DIRECTORY}ciphertext/`;
export const OFFLINE_MANIFEST_FILE_PATH = `${OFFLINE_ROOT_DIRECTORY}manifest.json`;

/**
 * Ensures offline storage directories exist under the app document directory.
 */
export async function ensureOfflineStorageDirectories(): Promise<void> {
  await FileSystem.makeDirectoryAsync(OFFLINE_CIPHERTEXT_DIRECTORY, { intermediates: true });
}

/**
 * Returns the absolute path for an offline ciphertext file name.
 */
export function resolveOfflineCiphertextPath(fileName: string): string {
  return `${OFFLINE_CIPHERTEXT_DIRECTORY}${fileName}`;
}

/**
 * Deletes a file when it exists. Ignores missing paths.
 */
export async function deleteOfflineFileIfExists(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    return;
  }
  await FileSystem.deleteAsync(path, { idempotent: true });
}

/**
 * Reads a ciphertext file into memory for checksum verification or decrypt.
 */
export async function readOfflineCiphertextFile(path: string): Promise<Uint8Array> {
  const base64: string = await FileSystem.readAsStringAsync(path, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return decodeBase64ToBytes(base64);
}

/**
 * Downloads encrypted bytes from a grant URL into the offline ciphertext directory.
 */
export async function downloadOfflineCiphertextFile(input: {
  readonly url: string;
  readonly targetPath: string;
}): Promise<void> {
  await ensureOfflineStorageDirectories();
  const result = await FileSystem.downloadAsync(input.url, input.targetPath);
  if (result.status < 200 || result.status >= 300) {
    throw new Error('Could not download the book for offline reading.');
  }
}

function decodeBase64ToBytes(base64: string): Uint8Array {
  const normalized: string = base64.trim();
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
