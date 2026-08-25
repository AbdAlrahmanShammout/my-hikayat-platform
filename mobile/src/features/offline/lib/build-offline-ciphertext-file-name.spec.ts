import { buildOfflineCiphertextFileName } from '@/features/offline/lib/build-offline-ciphertext-file-name';

describe('buildOfflineCiphertextFileName', () => {
  it('builds a stable encrypted file name from book and asset ids', () => {
    expect(buildOfflineCiphertextFileName(12, 34)).toBe('12-34.enc');
  });
});
