import type { ValidationErrorObject } from '@/api/validation-error-object';

export type ApiErrorBody = {
  readonly message: string;
  readonly code: string;
  readonly statusCode: number;
  readonly validationErrorObjects?: ValidationErrorObject[];
  readonly retryAfterSeconds?: number;
};

/**
 * Normalized failure from the NestJS exception envelope.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly validationErrorObjects: readonly ValidationErrorObject[];
  readonly retryAfterSeconds: number | undefined;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.code = body.code;
    this.statusCode = body.statusCode;
    this.validationErrorObjects = body.validationErrorObjects ?? [];
    this.retryAfterSeconds = body.retryAfterSeconds;
  }

  get isUnauthenticated(): boolean {
    return this.statusCode === 401;
  }

  get isAccessDenied(): boolean {
    return this.statusCode === 403;
  }
}
