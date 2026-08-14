import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class CategoryInvalidWeightException extends InvalidStateException {
  constructor() {
    super({
      message: 'Category weight must be a number greater than zero',
      code: 'CATEGORY_INVALID_WEIGHT',
    });
  }
}
