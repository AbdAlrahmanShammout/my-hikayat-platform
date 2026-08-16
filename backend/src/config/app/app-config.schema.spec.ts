import { APP_CORS_ORIGINS_DEFAULT } from './app-config.schema';

describe('APP_CORS_ORIGINS_DEFAULT', () => {
  it('allows the API origin and the Vite dashboard origin', () => {
    expect(APP_CORS_ORIGINS_DEFAULT.split(',')).toEqual([
      'http://localhost:3000',
      'http://localhost:5173',
    ]);
  });
});
