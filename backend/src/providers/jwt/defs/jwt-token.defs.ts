import { JwtTokenPurpose } from '@/providers/jwt/enum/jwt-token-purpose.enum';

export type JwtCreateTokenInput<T extends object> = {
  readonly payload: T;
  readonly purpose: JwtTokenPurpose;
  readonly audience?: string;
};

export type JwtVerifyTokenInput = {
  readonly token: string;
  readonly purpose: JwtTokenPurpose;
  readonly audience?: string;
};
