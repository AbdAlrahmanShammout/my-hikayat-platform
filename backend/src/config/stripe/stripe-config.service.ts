import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class StripeConfigService extends BaseConfigService {
  get secretKey(): string {
    return this.getValue<string>('stripe.secretKey');
  }

  get webhookSecret(): string {
    return this.getValue<string>('stripe.webhookSecret');
  }
}
