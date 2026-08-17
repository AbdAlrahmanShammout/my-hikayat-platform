import { clearAccessToken, readAccessToken } from '@/api/access-token-store';
import { ApiError } from '@/api/api-error';
import { parseErrorResponse } from '@/api/parse-api-error';
import { getApiBaseUrl } from '@/config/env';

const FALLBACK_EMPTY_RESPONSE = 'The server returned an empty response';

export type RequestJsonInput = {
  readonly path: string;
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  readonly body?: unknown;
};

/**
 * Sends a JSON HTTP request to the NestJS API with an optional Bearer token.
 */
export async function requestJson<TResponse>(input: RequestJsonInput): Promise<TResponse> {
  const response: Response = await fetch(`${getApiBaseUrl()}${input.path}`, {
    method: input.method,
    headers: buildRequestHeaders(input.body !== undefined),
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
    credentials: 'omit',
  });
  if (!response.ok) {
    throw await toThrownApiError(response);
  }
  return parseSuccessJson<TResponse>(response);
}

function buildRequestHeaders(hasJsonBody: boolean): Headers {
  const headers: Headers = new Headers();
  headers.set('Accept', 'application/json');
  const accessToken: string | null = readAccessToken();
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
    clearAccessToken();
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
