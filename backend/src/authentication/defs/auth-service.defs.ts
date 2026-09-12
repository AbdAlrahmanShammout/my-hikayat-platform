import { UserEntity } from '@/modules/user/entity/user.entity';

export type RegisterUserServiceInput = {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
};

export type LoginUserServiceInput = {
  readonly email: string;
  readonly password: string;
};

export type AcceptAdminInvitationAuthInput = {
  readonly token: string;
  readonly password: string;
};

export type AuthSession = {
  readonly user: UserEntity;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: string;
};
