import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateUserRepoInput,
  ListUsersRepoInput,
  UpdateUserRepoInput,
  UserPage,
} from '@/modules/user/defs/user-repository.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

export abstract class UserRepository {
  abstract create(input: CreateUserRepoInput, context?: TransactionContext): Promise<UserEntity>;
  abstract findById(id: number): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract update(input: UpdateUserRepoInput, context?: TransactionContext): Promise<UserEntity>;
  abstract delete(id: number, context?: TransactionContext): Promise<UserEntity>;
  abstract list(input: ListUsersRepoInput): Promise<UserPage>;
  abstract countByRole(role: UserRole): Promise<number>;
}
