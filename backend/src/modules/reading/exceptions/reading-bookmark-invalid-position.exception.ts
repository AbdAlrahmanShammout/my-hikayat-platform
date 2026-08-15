import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

export class ReadingBookmarkInvalidPositionException extends InvalidStateException {
  constructor(layoutType: BookLayoutType) {
    super({
      message: `Reading bookmark position is invalid for ${layoutType} layout`,
      code: 'READING_BOOKMARK_INVALID_POSITION',
    });
  }
}
