import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import {
  WORDS_PER_PAGE_MAX,
  WORDS_PER_PAGE_MIN,
} from '@/modules/platform-setting/consts/platform-setting.constant';

export class PlatformSettingInvalidWordsPerPageException extends InvalidStateException {
  constructor() {
    super({
      message: `Words per page must be an integer from ${WORDS_PER_PAGE_MIN} to ${WORDS_PER_PAGE_MAX}`,
      code: 'PLATFORM_SETTING_INVALID_WORDS_PER_PAGE',
    });
  }
}
