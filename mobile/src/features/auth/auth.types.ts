import type { User } from '@/session/session.types';

/**
 * Session returned by POST /auth/login and POST /auth/register.
 */
export type AuthSession = {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: string;
  readonly user: User;
};

export type LoginRequest = {
  readonly email: string;
  readonly password: string;
};

export type RegisterRequest = {
  readonly email: string;
  readonly password: string;
};
