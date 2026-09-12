import { PlatformSettingsResponse } from './platform-settings.response';

describe('PlatformSettingsResponse', () => {
  it('projects public platform settings', () => {
    const actualResponse = new PlatformSettingsResponse({
      privacyPolicyUrl: 'https://example.com/privacy',
      termsOfServiceUrl: 'https://example.com/terms',
      aboutMission: 'Read together.',
      authCoverMediaUrl: 'https://example.com/cover.gif',
    });
    expect(actualResponse.privacyPolicyUrl).toBe('https://example.com/privacy');
    expect(actualResponse.termsOfServiceUrl).toBe('https://example.com/terms');
    expect(actualResponse.aboutMission).toBe('Read together.');
    expect(actualResponse.authCoverMediaUrl).toBe('https://example.com/cover.gif');
  });
});
