import { TransactionContext } from '@/common/base/transaction-context';
import { UpsertPlatformSettingRepoInput } from '@/modules/platform-setting/defs/platform-setting-repository.defs';
import { PlatformSettingEntity } from '@/modules/platform-setting/entity/platform-setting.entity';

export abstract class PlatformSettingRepository {
  abstract findByKey(
    key: string,
    context?: TransactionContext,
  ): Promise<PlatformSettingEntity | null>;
  abstract findByKeys(
    keys: readonly string[],
    context?: TransactionContext,
  ): Promise<PlatformSettingEntity[]>;
  abstract upsert(
    input: UpsertPlatformSettingRepoInput,
    context?: TransactionContext,
  ): Promise<PlatformSettingEntity>;
}
