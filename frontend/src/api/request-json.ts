import { clearSessionTokens, readAccessToken, readRefreshToken, writeAccessToken, writeRefreshToken } from '@/api/access-token-store';
import { ApiError } from '@/api/api-error';
import { parseErrorResponse } from '@/api/parse-api-error';
import { getApiBaseUrl } from '@/config/env';
import type { AuthSession } from '@/features/auth/api/auth-session';

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
  const response: Response = await executeAuthorized(input);
  return parseSuccessJson<TResponse>(response);
}

/**
 * Downloads a binary admin response, including CSV exports.
 */
export async function requestBlob(path: string): Promise<{ blob: Blob; fileName: string }> {
  const response: Response = await executeAuthorized({ path, method: 'GET' });
  return {
    blob: await response.blob(),
    fileName: readContentDispositionFileName(response),
  };
}

async function executeAuthorized(input: RequestJsonInput): Promise<Response> {
  const response: Response = await executeFetch(input);
  if (response.ok) {
    return response;
  }
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
    clearSessionTokens();
    throw error;
  }
  const retryResponse: Response = await executeFetch({
    ...input,
    accessToken: readAccessToken() ?? undefined,
  });
  if (!retryResponse.ok) {
    const retryError: ApiError = await parseErrorResponse(retryResponse);
    if (retryError.isUnauthenticated) {
      clearSessionTokens();
    }
    throw retryError;
  }
  return retryResponse;
}

function readContentDispositionFileName(response: Response): string {
  const header: string = response.headers.get('Content-Disposition') ?? '';
  const matched: RegExpExecArray | null = /filename="([^"]+)"/.exec(header);
  return matched?.[1] ?? 'export.csv';
}

async function executeFetch(input: RequestJsonInput): Promise<Response> {
  return fetch(`${getApiBaseUrl()}${input.path}`, {
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
      const response: Response = await executeFetch({
        path: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
        skipAuthRefresh: true,
      });
      if (!response.ok) {
        return false;
      }
      const session: AuthSession = await parseSuccessJson<AuthSession>(response);
      writeAccessToken(session.accessToken);
      writeRefreshToken(session.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
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
