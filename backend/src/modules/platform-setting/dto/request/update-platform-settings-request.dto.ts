import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, ValidateIf } from 'class-validator';

import {
  ABOUT_MISSION_MAX_LENGTH,
  PLATFORM_SETTING_URL_MAX_LENGTH,
  WORDS_PER_PAGE_MAX,
  WORDS_PER_PAGE_MIN,
} from '@/modules/platform-setting/consts/platform-setting.constant';

function parseOptionalUrl(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const normalized: string = value.trim();
  return normalized.length === 0 ? null : normalized;
}

function parseOptionalWordsPerPage(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const normalized: string = value.trim();
  if (normalized.length === 0) {
    return null;
  }
  return Number(normalized);
}

function parseOptionalText(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const normalized: string = value.trim();
  return normalized.length === 0 ? null : normalized;
}

export class UpdatePlatformSettingsRequestDto {
  @ApiPropertyOptional({
    description: 'Public Privacy Policy URL. Empty string clears the configured link.',
    example: 'https://example.com/privacy',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null && value !== '')
  @IsString()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(PLATFORM_SETTING_URL_MAX_LENGTH)
  @Transform(({ value }: { value: unknown }) => parseOptionalUrl(value))
  privacyPolicyUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Public Terms of Service URL. Empty string clears the configured link.',
    example: 'https://example.com/terms',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null && value !== '')
  @IsString()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(PLATFORM_SETTING_URL_MAX_LENGTH)
  @Transform(({ value }: { value: unknown }) => parseOptionalUrl(value))
  termsOfServiceUrl?: string | null;

  @ApiPropertyOptional({
    description: 'About My Hikayat mission copy. Empty string clears the copy.',
    example: 'My Hikayat is a reading app for children, families, and anyone who loves stories.',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsString()
  @MaxLength(ABOUT_MISSION_MAX_LENGTH)
  @Transform(({ value }: { value: unknown }) => parseOptionalText(value))
  aboutMission?: string | null;

  @ApiPropertyOptional({
    description:
      'Public GIF or muted MP4 URL for Sign in/up chrome. Landscape 16:9 or a 3:1 strip. Empty string clears.',
    example: 'https://example.com/auth-cover.gif',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null && value !== '')
  @IsString()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(PLATFORM_SETTING_URL_MAX_LENGTH)
  @Transform(({ value }: { value: unknown }) => parseOptionalUrl(value))
  authCoverMediaUrl?: string | null;

  @ApiPropertyOptional({
    description:
      'Average words on one reflowable page. Null resets the value to 150. Omitted leaves it unchanged.',
    example: 150,
    nullable: true,
    minimum: WORDS_PER_PAGE_MIN,
    maximum: WORDS_PER_PAGE_MAX,
  })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsInt()
  @Min(WORDS_PER_PAGE_MIN)
  @Max(WORDS_PER_PAGE_MAX)
  @Transform(({ value }: { value: unknown }) => parseOptionalWordsPerPage(value))
  wordsPerPage?: number | null;
}
