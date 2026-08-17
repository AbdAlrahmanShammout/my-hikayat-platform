import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';
import { Environment } from '../environment';

@Injectable()
export class AppConfigService extends BaseConfigService {
  get env(): Environment {
    return this.getValue<Environment>('app.env');
  }

  get port(): number {
    return this.getValue<number>('app.port');
  }

  get allowedOrigins(): string[] {
    return this.getValue<string[]>('app.allowedOrigins');
  }

  get publicOrigin(): string {
    return this.getValue<string>('app.publicOrigin');
  }
}
