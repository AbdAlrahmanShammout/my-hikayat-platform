import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { BookLayoutType } from '@/modules/book/enum/general.enum';

export class ReadingProgressInvalidPositionException extends InvalidStateException {
  constructor(layoutType: BookLayoutType) {
    super({
      message: `Reading progress position is invalid for ${layoutType} layout`,
      code: 'READING_PROGRESS_INVALID_POSITION',
    });
  }
}
