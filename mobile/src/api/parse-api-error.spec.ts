import { parseErrorResponse } from './parse-api-error';

describe('parseErrorResponse', () => {
  it('maps a NestJS error envelope', async () => {
    const inputResponse: Response = new Response(
      JSON.stringify({
        message: 'Authentication failed',
        code: 'AUTHENTICATION_FAILED',
        statusCode: 401,
      }),
      { status: 401 },
    );
    const actualError = await parseErrorResponse(inputResponse);
    expect(actualError.message).toBe('Authentication failed');
    expect(actualError.code).toBe('AUTHENTICATION_FAILED');
    expect(actualError.statusCode).toBe(401);
    expect(actualError.isUnauthenticated).toBe(true);
  });

  it('falls back when the body is empty', async () => {
    const inputResponse: Response = new Response('', { status: 500 });
    const actualError = await parseErrorResponse(inputResponse);
    expect(actualError.message).toBe('The request failed');
    expect(actualError.code).toBe('HTTP_EXCEPTION');
    expect(actualError.statusCode).toBe(500);
  });
});
