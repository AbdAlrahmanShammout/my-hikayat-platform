import { applyAuthFormApiError } from './apply-auth-form-api-error';
import { ApiError } from '@/api/api-error';
import type { UseFormSetError } from 'react-hook-form';

type AuthFields = {
  email: string;
  password: string;
};

describe('applyAuthFormApiError', () => {
  it('maps validationErrorObjects onto email and password and sets root', () => {
    const calls: { name: string; message: string }[] = [];
    const setError: UseFormSetError<AuthFields> = ((name, error) => {
      calls.push({ name: String(name), message: String(error.message ?? '') });
    }) as UseFormSetError<AuthFields>;
    const inputError = new ApiError({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      validationErrorObjects: [
        { property: 'email', constraints: { isEmail: 'email must be an email' } },
        { property: 'password', constraints: { minLength: 'password is too short' } },
      ],
    });
    applyAuthFormApiError(inputError, setError, 'Could not sign in.');
    expect(calls).toEqual([
      { name: 'email', message: 'email must be an email' },
      { name: 'password', message: 'password is too short' },
      { name: 'root', message: 'Validation failed' },
    ]);
  });

  it('uses the fallback when the error is unknown', () => {
    const calls: { name: string; message: string }[] = [];
    const setError: UseFormSetError<AuthFields> = ((name, error) => {
      calls.push({ name: String(name), message: String(error.message ?? '') });
    }) as UseFormSetError<AuthFields>;
    applyAuthFormApiError({}, setError, 'Could not sign in.');
    expect(calls).toEqual([{ name: 'root', message: 'Could not sign in.' }]);
  });
});
