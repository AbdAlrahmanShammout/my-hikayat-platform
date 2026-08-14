import { UserRole } from '@/modules/user/enum/general.enum';

export type CreateUserRepoInput = {
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly isPublisher: boolean;
};

export type UpdatePublisherCapabilityRepoInput = {
  readonly id: number;
  readonly role: UserRole;
  readonly isPublisher: boolean;
};
