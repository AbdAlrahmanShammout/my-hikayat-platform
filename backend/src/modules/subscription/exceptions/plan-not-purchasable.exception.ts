import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class PlanNotPurchasableException extends InvalidStateException {
  constructor() {
    super({
      message: 'Selected plan is not available for checkout',
      code: 'PLAN_NOT_PURCHASABLE',
    });
  }
}
