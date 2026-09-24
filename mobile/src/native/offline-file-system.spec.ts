const mockMakeDirectoryAsync = jest.fn();
const mockGetInfoAsync = jest.fn();
const mockDeleteAsync = jest.fn();
const mockReadAsStringAsync = jest.fn();
const mockWriteAsStringAsync = jest.fn();
const mockDownloadAsync = jest.fn();
const mockCreateDownloadResumable = jest.fn();

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file://native/',
  EncodingType: { Base64: 'base64' },
  makeDirectoryAsync: (...args: unknown[]) => mockMakeDirectoryAsync(...args),
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
  deleteAsync: (...args: unknown[]) => mockDeleteAsync(...args),
  readAsStringAsync: (...args: unknown[]) => mockReadAsStringAsync(...args),
  writeAsStringAsync: (...args: unknown[]) => mockWriteAsStringAsync(...args),
  downloadAsync: (...args: unknown[]) => mockDownloadAsync(...args),
  createDownloadResumable: (...args: unknown[]) => mockCreateDownloadResumable(...args),
}));

import { offlineFileSystem } from '@/native/offline-file-system';

describe('offlineFileSystem on web', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('treats directories as already available without calling native makeDirectoryAsync', async () => {
    await expect(
      offlineFileSystem.makeDirectoryAsync('web-offline://ciphertext/', { intermediates: true }),
    ).resolves.toBeUndefined();
    expect(mockMakeDirectoryAsync).not.toHaveBeenCalled();
  });

  it('reports missing files so manifest reads stay empty', async () => {
    await expect(offlineFileSystem.getInfoAsync('web-offline://manifest.json')).resolves.toEqual({
      exists: false,
      uri: 'web-offline://manifest.json',
      isDirectory: false,
    });
    expect(mockGetInfoAsync).not.toHaveBeenCalled();
  });

  it('rejects ciphertext download instead of calling native download APIs', async () => {
    await expect(
      offlineFileSystem.downloadAsync('https://example.test/book.bin', 'web-offline://book.bin'),
    ).rejects.toThrow('Offline file storage is not available on web.');
    expect(mockDownloadAsync).not.toHaveBeenCalled();
  });
});
