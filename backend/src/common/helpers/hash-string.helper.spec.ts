import { compareHashString } from './compare-hash-string.helper';
import { hashString } from './hash-string.helper';

describe('hashString', () => {
  it('produces a digest that matches the original value', async () => {
    const inputValue = 'correct-horse-battery';
    const actualHash: string = await hashString(inputValue);
    const actualIsMatch: boolean = await compareHashString(inputValue, actualHash);
    expect(actualHash).not.toBe(inputValue);
    expect(actualIsMatch).toBe(true);
  });
});
