import { MEMORY_STORAGE_URI_SCHEME } from './consts';

describe('MEMORY_STORAGE_URI_SCHEME', () => {
  it('identifies in-memory object URLs', () => {
    expect(MEMORY_STORAGE_URI_SCHEME).toBe('memory');
  });
});
