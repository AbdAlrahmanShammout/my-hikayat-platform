import { readRequestPublicOrigin } from './read-request-public-origin.helper';

describe('readRequestPublicOrigin', () => {
  it('reads protocol and Host from the request', () => {
    const actualOrigin: string = readRequestPublicOrigin({
      protocol: 'http',
      headers: {},
      get: (name: string): string | undefined =>
        name.toLowerCase() === 'host' ? '54.225.86.205' : undefined,
    });
    expect(actualOrigin).toBe('http://54.225.86.205');
  });

  it('prefers forwarded proto and host from a reverse proxy', () => {
    const actualOrigin: string = readRequestPublicOrigin({
      protocol: 'http',
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'app.example.com',
      },
      get: (name: string): string | undefined =>
        name.toLowerCase() === 'host' ? '127.0.0.1:3000' : undefined,
    });
    expect(actualOrigin).toBe('https://app.example.com');
  });
});
