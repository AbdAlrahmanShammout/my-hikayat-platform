import { PlanKind } from '@/modules/subscription/enum/general.enum';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { AdminUserSortField, AdminUserSortOrder } from '@/modules/user/enum/admin-user-sort-field.enum';
import { UserRole } from '@/modules/user/enum/general.enum';

export type CreateUserRepoInput = {
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string | null;
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
  readonly excludeRole?: UserRole;
  readonly isPublisher?: boolean;
  readonly email?: string;
  readonly keyword?: string;
  readonly sortBy?: AdminUserSortField;
  readonly sortOrder?: AdminUserSortOrder;
};

export type UserPage = {
  readonly entities: UserEntity[];
  readonly total: number;
};

export type ManagedUserCurrentPlan = {
  readonly name: string;
  readonly kind: PlanKind;
};

export type ManagedUserListItem = {
  readonly user: UserEntity;
  readonly lastSessionAt: Date | null;
  readonly currentPlan: ManagedUserCurrentPlan | null;
};

export type ManagedUserPage = {
  readonly items: ManagedUserListItem[];
  readonly total: number;
};
