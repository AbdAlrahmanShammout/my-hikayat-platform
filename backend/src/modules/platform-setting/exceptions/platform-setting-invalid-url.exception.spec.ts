import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { PlatformSettingInvalidUrlException } from './platform-setting-invalid-url.exception';

describe('PlatformSettingInvalidUrlException', () => {
  it('reports an invalid privacy policy URL', () => {
    const actualException = new PlatformSettingInvalidUrlException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('PLATFORM_SETTING_INVALID_URL');
  });
});
