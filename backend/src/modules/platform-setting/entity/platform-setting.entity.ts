import { BaseEntity } from '@/common/base/base.entity';
import { PlatformSettingZodType } from '@/modules/platform-setting/zod/platform-setting.zod';

export class PlatformSettingEntity extends BaseEntity {
  key!: string;
  value!: string | null;

  constructor(data: PlatformSettingZodType) {
    super();
    Object.assign(this, data);
  }
}
