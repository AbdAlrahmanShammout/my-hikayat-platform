import { ApiError, type ApiErrorBody } from '@/api/api-error';
import type { ValidationErrorObject } from '@/api/validation-error-object';

const FALLBACK_MESSAGE = 'The request failed';
const FALLBACK_CODE = 'HTTP_EXCEPTION';

/**
 * Maps a failed HTTP response onto the dashboard ApiError type.
 */
export async function parseErrorResponse(response: Response): Promise<ApiError> {
  const body: unknown = await readResponseBody(response);
  return mapUnknownToApiError(body, response.status);
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text: string = await response.text();
  if (text.trim() === '') {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function mapUnknownToApiError(body: unknown, statusCode: number): ApiError {
  if (!isRecord(body)) {
    return new ApiError({
      message: FALLBACK_MESSAGE,
      code: FALLBACK_CODE,
      statusCode,
    });
  }
  return new ApiError(toApiErrorBody(body, statusCode));
}

function toApiErrorBody(body: Record<string, unknown>, statusCode: number): ApiErrorBody {
  return {
    message: readString(body.message) ?? FALLBACK_MESSAGE,
    code: readString(body.code) ?? FALLBACK_CODE,
    statusCode: readNumber(body.statusCode) ?? statusCode,
    validationErrorObjects: readValidationErrorObjects(body.validationErrorObjects),
  };
}

function readValidationErrorObjects(value: unknown): ValidationErrorObject[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items: ValidationErrorObject[] = value.filter(isValidationErrorObject);
  return items.length === 0 ? undefined : items;
}

function isValidationErrorObject(value: unknown): value is ValidationErrorObject {
  if (!isRecord(value) || typeof value.property !== 'string' || !isRecord(value.constraints)) {
    return false;
  }
  return Object.values(value.constraints).every((item) => typeof item === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
