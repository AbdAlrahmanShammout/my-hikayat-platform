import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class PlatformSettingInvalidAboutMissionException extends InvalidStateException {
  constructor() {
    super({
      message: 'About mission must be 2000 characters or fewer',
      code: 'PLATFORM_SETTING_INVALID_ABOUT_MISSION',
    });
  }
}
