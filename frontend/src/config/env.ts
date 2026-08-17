const FALLBACK_API_BASE_URL = 'http://localhost:3000';

/**
 * Returns the NestJS API origin used by the dashboard HTTP client.
 */
export function getApiBaseUrl(): string {
  const configured: string | undefined = import.meta.env.VITE_API_BASE_URL;
  if (configured === undefined || configured.trim() === '') {
    return FALLBACK_API_BASE_URL;
  }
  return configured.replace(/\/$/, '');
}
