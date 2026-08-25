import { buildOfflineDekStorageKey } from '@/storage/offline-dek-storage';

describe('buildOfflineDekStorageKey', () => {
  it('scopes cached DEKs by book and asset id', () => {
    expect(buildOfflineDekStorageKey(3, 7)).toBe('offline.dek.3.7');
  });
});
