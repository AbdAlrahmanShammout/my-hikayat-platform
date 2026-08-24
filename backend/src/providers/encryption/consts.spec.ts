import { AES_256_GCM } from './consts';

describe('AES_256_GCM', () => {
  it('uses a 12-byte IV, 16-byte auth tag, and 32-byte data keys', () => {
    expect(AES_256_GCM.algorithm).toBe('aes-256-gcm');
    expect(AES_256_GCM.ivLength).toBe(12);
    expect(AES_256_GCM.authTagLength).toBe(16);
    expect(AES_256_GCM.dataKeyLength).toBe(32);
  });
});
