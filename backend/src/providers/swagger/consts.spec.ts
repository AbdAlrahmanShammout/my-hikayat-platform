import { Environment } from '@/config/environment';

import { SWAGGER_ENABLED_ENVIRONMENTS, SWAGGER_UI_PATH } from './consts';

describe('swagger constants', () => {
  it('exposes documentation only in development and staging', () => {
    expect(SWAGGER_UI_PATH).toBe('docs');
    expect(SWAGGER_ENABLED_ENVIRONMENTS).toEqual([Environment.DEVELOPMENT, Environment.STAGING]);
    expect(SWAGGER_ENABLED_ENVIRONMENTS).not.toContain(Environment.TEST);
    expect(SWAGGER_ENABLED_ENVIRONMENTS).not.toContain(Environment.PRODUCTION);
  });
});
