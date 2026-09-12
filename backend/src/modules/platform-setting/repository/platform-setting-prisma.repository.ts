import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { UpsertPlatformSettingRepoInput } from '@/modules/platform-setting/defs/platform-setting-repository.defs';
import { PlatformSettingEntity } from '@/modules/platform-setting/entity/platform-setting.entity';
import { PlatformSettingMapper } from '@/modules/platform-setting/mapper/platform-setting.mapper';
import { PlatformSettingRepository } from '@/modules/platform-setting/repository/platform-setting.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class PlatformSettingPrismaRepository implements PlatformSettingRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async findByKey(
    key: string,
    context?: TransactionContext,
  ): Promise<PlatformSettingEntity | null> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.platformSetting.findFirst({
      where: { key, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return PlatformSettingMapper.toEntity(result);
  }

  async findByKeys(
    keys: readonly string[],
    context?: TransactionContext,
  ): Promise<PlatformSettingEntity[]> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const rows = await client.platformSetting.findMany({
      where: { key: { in: [...keys] }, deletedAt: null },
    });
    return rows.map((row) => PlatformSettingMapper.toEntity(row));
  }

  async upsert(
    input: UpsertPlatformSettingRepoInput,
    context?: TransactionContext,
  ): Promise<PlatformSettingEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const existing = await client.platformSetting.findFirst({
      where: { key: input.key },
    });
    if (existing === null) {
      const created = await client.platformSetting.create({
        data: {
          key: input.key,
          value: input.value,
        },
      });
      return PlatformSettingMapper.toEntity(created);
    }
    const updated = await client.platformSetting.update({
      where: { id: existing.id },
      data: {
        value: input.value,
        deletedAt: null,
      },
    });
    return PlatformSettingMapper.toEntity(updated);
  }
}
