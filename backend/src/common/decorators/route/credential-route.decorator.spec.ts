import { IS_CREDENTIAL_ROUTE_KEY, CredentialRoute } from './credential-route.decorator';

describe('CredentialRoute', () => {
  it('exports a stable metadata key', () => {
    expect(IS_CREDENTIAL_ROUTE_KEY).toBe('isCredentialRoute');
    expect(CredentialRoute().KEY).toBe(IS_CREDENTIAL_ROUTE_KEY);
  });
});
