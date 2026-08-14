import { TransactionContext } from '@/common/base/transaction-context';
import { CreateUserRepoInput } from '@/modules/user/defs/user-repository.defs';
import { UserEntity } from '@/modules/user/entity/user.entity';

export abstract class UserRepository {
  abstract create(input: CreateUserRepoInput, context?: TransactionContext): Promise<UserEntity>;
  abstract findById(id: number): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
}
