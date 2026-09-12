import { PlatformSettingEntity } from '@/modules/platform-setting/entity/platform-setting.entity';
import { PlatformSettingType } from '@/modules/platform-setting/types/platform-setting-details-schema.type';

export class PlatformSettingMapper {
  static toEntity(schema: PlatformSettingType): PlatformSettingEntity {
    return new PlatformSettingEntity({
      id: schema.id,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      deletedAt: schema.deletedAt,
      key: schema.key,
      value: schema.value,
    });
  }
}
