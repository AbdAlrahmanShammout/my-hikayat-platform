import { TransactionContext } from '@/common/base/transaction-context';
import { CreateAuthRefreshTokenRepoInput } from '@/modules/user/defs/auth-refresh-token-repository.defs';
import { AuthRefreshTokenEntity } from '@/modules/user/entity/auth-refresh-token.entity';

export abstract class AuthRefreshTokenRepository {
  abstract create(
    input: CreateAuthRefreshTokenRepoInput,
    context?: TransactionContext,
  ): Promise<AuthRefreshTokenEntity>;
  abstract findByTokenHash(tokenHash: string): Promise<AuthRefreshTokenEntity | null>;
  abstract revoke(id: number, revokedAt: Date, context?: TransactionContext): Promise<void>;
  abstract revokeAllForUser(
    userId: number,
    revokedAt: Date,
    context?: TransactionContext,
  ): Promise<void>;
}
