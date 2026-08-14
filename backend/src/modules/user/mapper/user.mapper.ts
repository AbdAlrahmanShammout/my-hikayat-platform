import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserType } from '@/modules/user/types/user-details-schema.type';

export class UserMapper {
  static toEntity(schema: UserType): UserEntity {
    return new UserEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      email: schema.email,
      passwordHash: schema.passwordHash,
      role: schema.role as UserRole,
      isPublisher: schema.isPublisher,
    });
  }
}
