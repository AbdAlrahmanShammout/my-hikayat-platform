import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

export type CreateUserRepoInput = {
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly isPublisher: boolean;
};

export type UpdateUserRepoInput = {
  readonly id: number;
  readonly role: UserRole;
  readonly isPublisher: boolean;
  readonly passwordHash?: string;
};

export type ListUsersRepoInput = {
  readonly limit: number;
  readonly offset: number;
  readonly role?: UserRole;
  readonly isPublisher?: boolean;
  readonly email?: string;
};

export type UserPage = {
  readonly entities: UserEntity[];
  readonly total: number;
};
