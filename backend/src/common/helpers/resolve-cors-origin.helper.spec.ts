import { Environment } from '@/config/environment';

import { resolveCorsOrigin } from './resolve-cors-origin.helper';

describe('resolveCorsOrigin', () => {
  const inputAllowedOrigins: readonly string[] = ['http://localhost:3000'];

  it('returns true in development so any request origin is reflected', () => {
    const actualOrigin: true | string[] = resolveCorsOrigin({
      env: Environment.DEVELOPMENT,
      allowedOrigins: inputAllowedOrigins,
    });
    expect(actualOrigin).toBe(true);
  });

  it.each([Environment.TEST, Environment.STAGING, Environment.PRODUCTION])(
    'returns the configured allowlist in %s',
    (inputEnv: Environment) => {
      const actualOrigin: true | string[] = resolveCorsOrigin({
        env: inputEnv,
        allowedOrigins: inputAllowedOrigins,
      });
      expect(actualOrigin).toEqual(['http://localhost:3000']);
    },
  );
});
