import { AuthenticationFailedException } from '@/common/exceptions/authentication-failed.exception';

/**
 * Refresh token is missing, expired, revoked, or otherwise unusable.
 * Maps to authentication failure so clients clear session without leaking reason detail.
 */
export class RefreshTokenInvalidException extends AuthenticationFailedException {}
