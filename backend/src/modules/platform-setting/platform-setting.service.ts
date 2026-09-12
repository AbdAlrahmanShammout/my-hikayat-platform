import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import {
  ABOUT_MISSION_KEY,
  ABOUT_MISSION_MAX_LENGTH,
  AUTH_COVER_MEDIA_URL_KEY,
  PLATFORM_SETTING_KEYS,
  PLATFORM_SETTING_URL_MAX_LENGTH,
  PRIVACY_POLICY_URL_KEY,
  TERMS_OF_SERVICE_URL_KEY,
} from '@/modules/platform-setting/consts/platform-setting.constant';
import {
  PlatformSettingsSnapshot,
  UpdatePlatformSettingsServiceInput,
} from '@/modules/platform-setting/defs/platform-setting-service.defs';
import { PlatformSettingEntity } from '@/modules/platform-setting/entity/platform-setting.entity';
import { PlatformSettingInvalidAboutMissionException } from '@/modules/platform-setting/exceptions/platform-setting-invalid-about-mission.exception';
import { PlatformSettingInvalidUrlException } from '@/modules/platform-setting/exceptions/platform-setting-invalid-url.exception';
import { PlatformSettingRepository } from '@/modules/platform-setting/repository/platform-setting.repository';

@Injectable()
export class PlatformSettingService {
  constructor(
    private readonly platformSettingRepository: PlatformSettingRepository,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async getPlatformSettings(): Promise<PlatformSettingsSnapshot> {
    const settings: PlatformSettingEntity[] = await this.platformSettingRepository.findByKeys(
      PLATFORM_SETTING_KEYS,
    );
    return PlatformSettingService.toSnapshot(settings);
  }

  async updatePlatformSettings(
    input: UpdatePlatformSettingsServiceInput,
  ): Promise<PlatformSettingsSnapshot> {
    if (!PlatformSettingService.hasDefinedField(input)) {
      return this.getPlatformSettings();
    }
    return this.transactionRunner.run(async (context: TransactionContext) => {
      if (input.privacyPolicyUrl !== undefined) {
        await this.platformSettingRepository.upsert(
          {
            key: PRIVACY_POLICY_URL_KEY,
            value: PlatformSettingService.normalizeUrl(input.privacyPolicyUrl),
          },
          context,
        );
      }
      if (input.termsOfServiceUrl !== undefined) {
        await this.platformSettingRepository.upsert(
          {
            key: TERMS_OF_SERVICE_URL_KEY,
            value: PlatformSettingService.normalizeUrl(input.termsOfServiceUrl),
          },
          context,
        );
      }
      if (input.aboutMission !== undefined) {
        await this.platformSettingRepository.upsert(
          {
            key: ABOUT_MISSION_KEY,
            value: PlatformSettingService.normalizeAboutMission(input.aboutMission),
          },
          context,
        );
      }
      if (input.authCoverMediaUrl !== undefined) {
        await this.platformSettingRepository.upsert(
          {
            key: AUTH_COVER_MEDIA_URL_KEY,
            value: PlatformSettingService.normalizeUrl(input.authCoverMediaUrl),
          },
          context,
        );
      }
      const settings: PlatformSettingEntity[] = await this.platformSettingRepository.findByKeys(
        PLATFORM_SETTING_KEYS,
        context,
      );
      return PlatformSettingService.toSnapshot(settings);
    });
  }

  private static hasDefinedField(input: UpdatePlatformSettingsServiceInput): boolean {
    return (
      input.privacyPolicyUrl !== undefined ||
      input.termsOfServiceUrl !== undefined ||
      input.aboutMission !== undefined ||
      input.authCoverMediaUrl !== undefined
    );
  }

  private static toSnapshot(settings: readonly PlatformSettingEntity[]): PlatformSettingsSnapshot {
    return {
      privacyPolicyUrl: PlatformSettingService.readValue(settings, PRIVACY_POLICY_URL_KEY),
      termsOfServiceUrl: PlatformSettingService.readValue(settings, TERMS_OF_SERVICE_URL_KEY),
      aboutMission: PlatformSettingService.readValue(settings, ABOUT_MISSION_KEY),
      authCoverMediaUrl: PlatformSettingService.readValue(settings, AUTH_COVER_MEDIA_URL_KEY),
    };
  }

  private static readValue(
    settings: readonly PlatformSettingEntity[],
    key: string,
  ): string | null {
    return settings.find((setting) => setting.key === key)?.value ?? null;
  }

  private static normalizeAboutMission(value: string | null): string | null {
    if (value === null) {
      return null;
    }
    const normalized: string = value.trim();
    if (normalized.length === 0) {
      return null;
    }
    if (normalized.length > ABOUT_MISSION_MAX_LENGTH) {
      throw new PlatformSettingInvalidAboutMissionException();
    }
    return normalized;
  }

  private static normalizeUrl(value: string | null): string | null {
    if (value === null) {
      return null;
    }
    const normalized: string = value.trim();
    if (normalized.length === 0) {
      return null;
    }
    if (normalized.length > PLATFORM_SETTING_URL_MAX_LENGTH) {
      throw new PlatformSettingInvalidUrlException();
    }
    let parsed: URL;
    try {
      parsed = new URL(normalized);
    } catch {
      throw new PlatformSettingInvalidUrlException();
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new PlatformSettingInvalidUrlException();
    }
    return parsed.toString();
  }
}
