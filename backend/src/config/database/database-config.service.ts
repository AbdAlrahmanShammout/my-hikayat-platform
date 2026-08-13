import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class DatabaseConfigService extends BaseConfigService {
  get url(): string {
    return this.getValue<string>('db.url');
  }
}
