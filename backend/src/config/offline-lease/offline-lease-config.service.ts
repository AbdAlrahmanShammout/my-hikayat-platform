import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class OfflineLeaseConfigService extends BaseConfigService {
  get privateKey(): string {
    return this.getValue<string>('offlineLease.privateKey');
  }

  get keyId(): string {
    return this.getValue<string>('offlineLease.keyId');
  }
}
