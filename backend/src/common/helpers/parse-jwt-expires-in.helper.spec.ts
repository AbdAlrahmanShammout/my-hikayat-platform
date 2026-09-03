import { parseJwtExpiresInToMilliseconds } from './parse-jwt-expires-in.helper';

describe('parseJwtExpiresInToMilliseconds', () => {
  it('parses second, minute, hour, and day units', () => {
    expect(parseJwtExpiresInToMilliseconds('30s')).toBe(30_000);
    expect(parseJwtExpiresInToMilliseconds('15m')).toBe(15 * 60 * 1000);
    expect(parseJwtExpiresInToMilliseconds('1h')).toBe(60 * 60 * 1000);
    expect(parseJwtExpiresInToMilliseconds('30d')).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('rejects unsupported values', () => {
    expect(() => parseJwtExpiresInToMilliseconds('15')).toThrow(/Unsupported/);
  });
});
