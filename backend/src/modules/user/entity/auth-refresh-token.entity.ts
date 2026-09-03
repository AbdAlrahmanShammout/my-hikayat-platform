import { BaseEntity } from '@/common/base/base.entity';
import { AuthRefreshTokenZodType } from '@/modules/user/zod/auth-refresh-token.zod';

export class AuthRefreshTokenEntity extends BaseEntity {
  userId!: number;
  tokenHash!: string;
  expiresAt!: Date;
  revokedAt!: Date | null;

  constructor(data: AuthRefreshTokenZodType) {
    super();
    Object.assign(this, data);
  }
}
