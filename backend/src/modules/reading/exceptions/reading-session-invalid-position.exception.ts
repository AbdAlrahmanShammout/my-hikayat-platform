import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

export class ReadingSessionInvalidPositionException extends InvalidStateException {
  constructor(layoutType: BookLayoutType) {
    super({
      message: `Reading session position is invalid for ${layoutType} layout`,
      code: 'READING_SESSION_INVALID_POSITION',
    });
  }
}
