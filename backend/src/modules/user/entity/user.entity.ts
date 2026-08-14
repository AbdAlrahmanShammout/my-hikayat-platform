import { Principal } from '@/common/auth/principal.interface';
import { BaseEntity } from '@/common/base/base.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserZodType } from '@/modules/user/zod/user.zod';

export class UserEntity extends BaseEntity implements Principal {
  email!: string;
  passwordHash!: string;
  role!: UserRole;
  isPublisher!: boolean;

  constructor(data: UserZodType) {
    super();
    Object.assign(this, data);
  }
}
