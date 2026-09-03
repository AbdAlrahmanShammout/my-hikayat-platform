import { requestJson } from '@/api/client';

export type ResetPasswordRequest = {
  readonly token: string;
  readonly password: string;
};

export type ResetPasswordResponse = {
  readonly message: string;
};

/**
 * Sets a new password using a recovery token from email.
 */
export async function resetPassword(input: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return requestJson<ResetPasswordResponse>({
    path: '/auth/reset-password',
    method: 'POST',
    body: input,
  });
}
