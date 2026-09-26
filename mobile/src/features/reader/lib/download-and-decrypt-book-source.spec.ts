import { createBookAssetContentKey } from '@/features/reader/api/create-content-key';
import {
  downloadAndDecryptBookSource,
  type BookOpenProgress,
} from '@/features/reader/lib/download-and-decrypt-book-source';
import { decryptContentWithDataKey } from '@/features/reader/lib/decrypt-content-with-data-key';
import { offlineFileSystem } from '@/native/offline-file-system';

jest.mock('@/native/offline-file-system', () => ({
  offlineFileSystem: {
    cacheDirectory: 'file://cache/',
    documentDirectory: 'file://docs/',
    EncodingType: { Base64: 'base64' },
    createDownloadResumable: jest.fn(),
    readAsStringAsync: jest.fn(),
    deleteAsync: jest.fn(),
  },
}));

jest.mock('@/features/reader/api/create-content-key', () => ({
  createBookAssetContentKey: jest.fn(),
}));

jest.mock('@/features/reader/lib/decrypt-content-with-data-key', () => ({
  decodeContentKeyBase64: jest.fn(() => new Uint8Array(32)),
  decryptContentWithDataKey: jest.fn(() => new Uint8Array([7])),
  verifyCiphertextChecksum: jest.fn(),
}));

const mockCreateDownloadResumable = offlineFileSystem.createDownloadResumable as jest.Mock;
const mockReadAsStringAsync = offlineFileSystem.readAsStringAsync as jest.Mock;
const mockCreateContentKey = createBookAssetContentKey as jest.Mock;
const mockDecrypt = decryptContentWithDataKey as jest.Mock;

describe('downloadAndDecryptBookSource', () => {
  beforeEach(() => {
    mockCreateDownloadResumable.mockReset();
    mockReadAsStringAsync.mockReset();
    mockCreateContentKey.mockReset();
    mockDecrypt.mockClear();
    mockReadAsStringAsync.mockResolvedValue('');
    mockCreateContentKey.mockResolvedValue({
      keyDelivery: 'plain',
      algorithm: 'aes-256-gcm',
      key: 'AA==',
    });
  });

  it('reports bytes written before the download finishes', async () => {
    const updates: BookOpenProgress[] = [];
    mockCreateDownloadResumable.mockImplementation(
      (_url: string, _path: string, _options: unknown, onProgress?: (progress: {
        totalBytesWritten: number;
        totalBytesExpectedToWrite: number;
      }) => void) => {
        onProgress?.({ totalBytesWritten: 256, totalBytesExpectedToWrite: 1024 });
        return {
          downloadAsync: async () => ({ status: 200, uri: 'file://cache/book.bin' }),
        };
      },
    );
    await downloadAndDecryptBookSource({
      bookId: 8,
      sessionId: 12,
      deliveryGrant: {
        bookId: 8,
        bookAssetId: 9,
        kind: 'source',
        url: 'https://example.test/book.enc',
        expiresAt: '2026-08-29T12:05:00.000Z',
        contentType: 'application/epub+zip',
        byteSize: 1024,
        checksumSha256: null,
        isEncrypted: true,
      },
      onProgress: (progress) => {
        updates.push(progress);
      },
    });
    expect(updates).toContainEqual({
      phase: 'downloading',
      loadedBytes: 256,
      totalBytes: 1024,
    });
    expect(updates.at(-1)).toEqual({ phase: 'preparing' });
  });
});
