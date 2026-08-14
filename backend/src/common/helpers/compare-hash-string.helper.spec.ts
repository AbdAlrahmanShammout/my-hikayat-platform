import { compareHashString } from './compare-hash-string.helper';
import { hashString } from './hash-string.helper';

describe('compareHashString', () => {
  it('returns false when the value does not match the digest', async () => {
    const actualHash: string = await hashString('correct-horse-battery');
    const actualIsMatch: boolean = await compareHashString('wrong-password', actualHash);
    expect(actualIsMatch).toBe(false);
  });
});
