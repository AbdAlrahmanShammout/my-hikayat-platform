import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class MonetizationConfigService extends BaseConfigService {
  get platformCutPercent(): number {
    return this.getValue<number>('monetization.platformCutPercent');
  }
}
