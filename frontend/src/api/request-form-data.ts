import { clearAccessToken, readAccessToken } from '@/api/access-token-store';
import { ApiError } from '@/api/api-error';
import { parseErrorResponse } from '@/api/parse-api-error';
import { getApiBaseUrl } from '@/config/env';

const FALLBACK_EMPTY_RESPONSE = 'The server returned an empty response';

export type RequestFormDataInput = {
  readonly path: string;
  readonly method: 'POST';
  readonly body: FormData;
};

/**
 * Sends a multipart request. Does not set Content-Type so the browser can add the boundary.
 */
export async function requestFormData<TResponse>(input: RequestFormDataInput): Promise<TResponse> {
  const headers: Headers = new Headers();
  headers.set('Accept', 'application/json');
  const accessToken: string | null = readAccessToken();
  if (accessToken !== null) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  const response: Response = await fetch(`${getApiBaseUrl()}${input.path}`, {
    method: input.method,
    headers,
    body: input.body,
    credentials: 'omit',
  });
  if (!response.ok) {
    throw await toThrownApiError(response);
  }
  return parseSuccessJson<TResponse>(response);
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
