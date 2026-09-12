import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class PlatformSettingInvalidUrlException extends InvalidStateException {
  constructor() {
    super({
      message: 'URL must be an http or https address',
      code: 'PLATFORM_SETTING_INVALID_URL',
    });
  }
}
