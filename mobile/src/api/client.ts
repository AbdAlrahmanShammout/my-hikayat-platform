import { clearAccessToken, readAccessToken } from '@/session/session-store';
import { ApiError } from '@/api/api-error';
import { parseErrorResponse } from '@/api/parse-api-error';
import { getMobilePublicConfig } from '@/config/env';
import { recordTrustedServerDateHeader } from '@/storage/offline-trusted-time-storage';

const FALLBACK_EMPTY_RESPONSE = 'The server returned an empty response';

export type RequestJsonInput = {
  readonly path: string;
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  readonly body?: unknown;
  readonly accessToken?: string;
};

/**
 * Sends a JSON HTTP request to the NestJS API with an optional Bearer token.
 */
export async function requestJson<TResponse>(input: RequestJsonInput): Promise<TResponse> {
  const { apiBaseUrl } = getMobilePublicConfig();
  const response: Response = await fetch(`${apiBaseUrl}${input.path}`, {
    method: input.method,
    headers: buildRequestHeaders(input.body !== undefined, input.accessToken),
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
    credentials: 'omit',
  });
  if (!response.ok) {
    await recordTrustedServerDateHeader(response.headers.get('date'));
    throw await toThrownApiError(response);
  }
  await recordTrustedServerDateHeader(response.headers.get('date'));
  return parseSuccessJson<TResponse>(response);
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

async function toThrownApiError(response: Response): Promise<ApiError> {
  const error: ApiError = await parseErrorResponse(response);
  if (error.isUnauthenticated) {
    await clearAccessToken();
  }
  return error;
}

async function parseSuccessJson<TResponse>(response: Response): Promise<TResponse> {
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
