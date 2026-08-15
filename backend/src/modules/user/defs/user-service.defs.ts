import { UserRole } from '@/modules/user/enum/general.enum';

export type CreateUserServiceInput = {
  readonly email: string;
  readonly passwordHash: string;
};

export type EnablePublisherCapabilityServiceInput = {
  readonly userId: number;
};

export type ListUsersServiceInput = {
  readonly limit?: number;
  readonly offset?: number;
  readonly role?: UserRole;
  readonly isPublisher?: boolean;
  readonly email?: string;
};

export type UpdateManagedUserServiceInput = {
  readonly userId: number;
  readonly actorUserId: number;
  readonly role?: UserRole;
  readonly isPublisher?: boolean;
};

export type DeleteManagedUserServiceInput = {
  readonly userId: number;
  readonly actorUserId: number;
};
