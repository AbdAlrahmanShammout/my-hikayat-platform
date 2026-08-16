import {
  CORS_ALLOWED_METHODS,
  CREDENTIAL_THROTTLE_LIMIT,
  CREDENTIAL_THROTTLE_NAME,
  CREDENTIAL_THROTTLE_TTL_MS,
  DEFAULT_THROTTLE_LIMIT,
  DEFAULT_THROTTLE_NAME,
  DEFAULT_THROTTLE_TTL_MS,
  SKIP_ALL_NAMED_THROTTLERS,
  UNAUTHENTICATED_THROTTLE_LIMIT,
  UNAUTHENTICATED_THROTTLE_NAME,
  UNAUTHENTICATED_THROTTLE_TTL_MS,
} from './http-surface.constant';

describe('HTTP surface constants', () => {
  it('allows PUT so browser Smart Resume preflight can succeed', () => {
    expect(CORS_ALLOWED_METHODS).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  });

  it('keeps a conservative global floor and tighter unauthenticated and credential limits', () => {
    expect(DEFAULT_THROTTLE_NAME).toBe('default');
    expect(DEFAULT_THROTTLE_TTL_MS).toBe(60_000);
    expect(DEFAULT_THROTTLE_LIMIT).toBe(120);
    expect(UNAUTHENTICATED_THROTTLE_NAME).toBe('unauthenticated');
    expect(UNAUTHENTICATED_THROTTLE_TTL_MS).toBe(60_000);
    expect(UNAUTHENTICATED_THROTTLE_LIMIT).toBe(30);
    expect(CREDENTIAL_THROTTLE_NAME).toBe('credential');
    expect(CREDENTIAL_THROTTLE_TTL_MS).toBe(60_000);
    expect(CREDENTIAL_THROTTLE_LIMIT).toBe(5);
    expect(CREDENTIAL_THROTTLE_LIMIT).toBeLessThan(UNAUTHENTICATED_THROTTLE_LIMIT);
    expect(UNAUTHENTICATED_THROTTLE_LIMIT).toBeLessThan(DEFAULT_THROTTLE_LIMIT);
    expect(SKIP_ALL_NAMED_THROTTLERS).toEqual({
      default: true,
      unauthenticated: true,
      credential: true,
    });
  });
});
