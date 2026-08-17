import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/api-error';
import { parseErrorResponse } from '@/api/parse-api-error';

describe('parseErrorResponse', () => {
  it('maps the NestJS exception envelope', async () => {
    const inputResponse: Response = new Response(
      JSON.stringify({
        message: 'Authentication failed',
        code: 'AUTHENTICATION_FAILED',
        statusCode: 401,
      }),
      { status: 401 },
    );
    const actualError: ApiError = await parseErrorResponse(inputResponse);
    expect(actualError).toBeInstanceOf(ApiError);
    expect(actualError.message).toBe('Authentication failed');
    expect(actualError.code).toBe('AUTHENTICATION_FAILED');
    expect(actualError.statusCode).toBe(401);
    expect(actualError.isUnauthenticated).toBe(true);
  });

  it('maps validationErrorObjects when present', async () => {
    const inputResponse: Response = new Response(
      JSON.stringify({
        message: 'Validation failed',
        code: 'BAD_USER_INPUT',
        statusCode: 422,
        validationErrorObjects: [
          { property: 'email', constraints: { isEmail: 'email must be an email' } },
        ],
      }),
      { status: 422 },
    );
    const actualError: ApiError = await parseErrorResponse(inputResponse);
    expect(actualError.validationErrorObjects).toEqual([
      { property: 'email', constraints: { isEmail: 'email must be an email' } },
    ]);
  });

  it('falls back when the body is empty', async () => {
    const inputResponse: Response = new Response('', { status: 503 });
    const actualError: ApiError = await parseErrorResponse(inputResponse);
    expect(actualError.message).toBe('The request failed');
    expect(actualError.code).toBe('HTTP_EXCEPTION');
    expect(actualError.statusCode).toBe(503);
  });
});
