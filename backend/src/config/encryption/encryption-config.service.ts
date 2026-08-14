import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class EncryptionConfigService extends BaseConfigService {
  get key(): Buffer {
    return Buffer.from(this.getValue<string>('encryption.key'), 'hex');
  }
}
