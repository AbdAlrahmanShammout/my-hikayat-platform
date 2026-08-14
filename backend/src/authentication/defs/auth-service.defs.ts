import { UserEntity } from '@/modules/user/entity/user.entity';

export type RegisterUserServiceInput = {
  readonly email: string;
  readonly password: string;
};

export type LoginUserServiceInput = {
  readonly email: string;
  readonly password: string;
};

export type AuthSession = {
  readonly user: UserEntity;
  readonly accessToken: string;
  readonly expiresIn: string;
};
