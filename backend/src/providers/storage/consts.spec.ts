import { DEFAULT_STORAGE_CONTENT_TYPE } from './consts';

describe('DEFAULT_STORAGE_CONTENT_TYPE', () => {
  it('uses the S3-compatible octet-stream default', () => {
    expect(DEFAULT_STORAGE_CONTENT_TYPE).toBe('application/octet-stream');
  });
});
