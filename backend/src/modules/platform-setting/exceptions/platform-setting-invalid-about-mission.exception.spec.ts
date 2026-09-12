import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { PlatformSettingInvalidAboutMissionException } from './platform-setting-invalid-about-mission.exception';

describe('PlatformSettingInvalidAboutMissionException', () => {
  it('reports an overlong about mission', () => {
    const actualException = new PlatformSettingInvalidAboutMissionException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('PLATFORM_SETTING_INVALID_ABOUT_MISSION');
  });
});
