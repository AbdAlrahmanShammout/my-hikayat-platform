import { ApiError } from '@/api/api-error';
import { parseErrorResponse } from '@/api/parse-api-error';
import { getMobilePublicConfig } from '@/config/env';
import type { AuthSession } from '@/features/auth/auth.types';
import {
  clearSessionTokens,
  readAccessToken,
  readRefreshToken,
  writeAccessToken,
  writeRefreshToken,
} from '@/session/session-store';
import { recordTrustedServerDateHeader } from '@/storage/offline-trusted-time-storage';

const FALLBACK_EMPTY_RESPONSE = 'The server returned an empty response';

const AUTH_REFRESH_SKIP_PATHS: ReadonlySet<string> = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/accept-admin-invitation',
]);

export type RequestJsonInput = {
  readonly path: string;
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  readonly body?: unknown;
  readonly accessToken?: string;
  readonly skipAuthRefresh?: boolean;
};

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Sends a JSON HTTP request to the NestJS API with optional Bearer auth and single-flight refresh.
 */
export async function requestJson<TResponse>(input: RequestJsonInput): Promise<TResponse> {
  const response: Response = await executeFetch(input);
  if (response.ok) {
    await recordTrustedServerDateHeader(response.headers.get('date'));
    return parseSuccessJson<TResponse>(response);
  }
  await recordTrustedServerDateHeader(response.headers.get('date'));
  const error: ApiError = await parseErrorResponse(response);
  if (
    !error.isUnauthenticated ||
    input.skipAuthRefresh === true ||
    AUTH_REFRESH_SKIP_PATHS.has(input.path)
  ) {
    throw error;
  }
  const didRefresh: boolean = await refreshAccessTokenSingleFlight();
  if (!didRefresh) {
    await clearSessionTokens();
    throw error;
  }
  const retryResponse: Response = await executeFetch({
    ...input,
    accessToken: readAccessToken() ?? undefined,
  });
  if (!retryResponse.ok) {
    await recordTrustedServerDateHeader(retryResponse.headers.get('date'));
    const retryError: ApiError = await parseErrorResponse(retryResponse);
    if (retryError.isUnauthenticated) {
      await clearSessionTokens();
    }
    throw retryError;
  }
  await recordTrustedServerDateHeader(retryResponse.headers.get('date'));
  return parseSuccessJson<TResponse>(retryResponse);
}

async function executeFetch(input: RequestJsonInput): Promise<Response> {
  const { apiBaseUrl } = getMobilePublicConfig();
  return fetch(`${apiBaseUrl}${input.path}`, {
    method: input.method,
    headers: buildRequestHeaders(input.body !== undefined, input.accessToken),
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
    credentials: 'omit',
  });
}

function buildRequestHeaders(hasJsonBody: boolean, accessTokenOverride?: string): Headers {
  const headers: Headers = new Headers();
  headers.set('Accept', 'application/json');
  const accessToken: string | null = accessTokenOverride ?? readAccessToken();
  if (accessToken !== null) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (hasJsonBody) {
    headers.set('Content-Type', 'application/json');
  }
  return headers;
}

async function refreshAccessTokenSingleFlight(): Promise<boolean> {
  if (refreshInFlight !== null) {
    return refreshInFlight;
  }
  refreshInFlight = (async (): Promise<boolean> => {
    const refreshToken: string | null = readRefreshToken();
    if (refreshToken === null) {
      return false;
    }
    try {
      const session: AuthSession = await postRefreshSession(refreshToken);
      await writeAccessToken(session.accessToken);
      await writeRefreshToken(session.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function postRefreshSession(refreshToken: string): Promise<AuthSession> {
  const response: Response = await executeFetch({
    path: '/auth/refresh',
    method: 'POST',
    body: { refreshToken },
    skipAuthRefresh: true,
  });
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return parseSuccessJson<AuthSession>(response);
}

async function parseSuccessJson<TResponse>(response: Response): Promise<TResponse> {
  if (response.status === 204) {
    return undefined as TResponse;
  }
  const text: string = await response.text();
  if (text.trim() === '') {
    throw new ApiError({
      message: FALLBACK_EMPTY_RESPONSE,
      code: 'HTTP_EXCEPTION',
      statusCode: response.status,
    });
  }
  return JSON.parse(text) as TResponse;
}
