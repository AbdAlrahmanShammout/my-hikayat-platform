import { ApiProperty } from '@nestjs/swagger';

export class PlatformSettingsResponse {
  @ApiProperty({
    description: 'Public Privacy Policy URL configured by an admin',
    example: 'https://example.com/privacy',
    nullable: true,
  })
  privacyPolicyUrl: string | null;

  @ApiProperty({
    description: 'Public Terms of Service URL configured by an admin',
    example: 'https://example.com/terms',
    nullable: true,
  })
  termsOfServiceUrl: string | null;

  @ApiProperty({
    description: 'About My Hikayat mission copy shown in the reader app',
    example: 'My Hikayat is a reading app for children, families, and anyone who loves stories.',
    nullable: true,
  })
  aboutMission: string | null;

  @ApiProperty({
    description:
      'Public GIF or muted video URL for Sign in/up cover chrome. Landscape 16:9 or a 3:1 strip.',
    example: 'https://example.com/auth-cover.gif',
    nullable: true,
  })
  authCoverMediaUrl: string | null;

  constructor(settings: {
    readonly privacyPolicyUrl: string | null;
    readonly termsOfServiceUrl: string | null;
    readonly aboutMission: string | null;
    readonly authCoverMediaUrl: string | null;
  }) {
    this.privacyPolicyUrl = settings.privacyPolicyUrl;
    this.termsOfServiceUrl = settings.termsOfServiceUrl;
    this.aboutMission = settings.aboutMission;
    this.authCoverMediaUrl = settings.authCoverMediaUrl;
  }
}
