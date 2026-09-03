import { AuthRefreshTokenEntity } from '@/modules/user/entity/auth-refresh-token.entity';
import { AuthRefreshTokenType } from '@/modules/user/types/auth-refresh-token-details-schema.type';

export class AuthRefreshTokenMapper {
  static toEntity(schema: AuthRefreshTokenType): AuthRefreshTokenEntity {
    return new AuthRefreshTokenEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      userId: schema.userId,
      tokenHash: schema.tokenHash,
      expiresAt: schema.expiresAt,
      revokedAt: schema.revokedAt,
    });
  }
}
