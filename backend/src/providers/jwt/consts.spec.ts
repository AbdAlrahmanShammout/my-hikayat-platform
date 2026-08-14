import { JWT_ISSUER } from './consts';

describe('JWT_ISSUER', () => {
  it('identifies tokens as issued by this application', () => {
    expect(JWT_ISSUER).toBe('lib-app');
  });
});
