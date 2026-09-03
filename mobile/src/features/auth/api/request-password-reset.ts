import { requestJson } from '@/api/client';

export type ForgotPasswordRequest = {
  readonly email: string;
};

export type ForgotPasswordResponse = {
  readonly message: string;
};

/**
 * Requests a password-reset email. Response is enumeration-safe.
 */
export async function requestPasswordReset(
  input: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  return requestJson<ForgotPasswordResponse>({
    path: '/auth/forgot-password',
    method: 'POST',
    body: input,
  });
}
