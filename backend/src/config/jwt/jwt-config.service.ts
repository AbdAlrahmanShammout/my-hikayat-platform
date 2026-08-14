import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class JwtConfigService extends BaseConfigService {
  get accessSecret(): string {
    return this.getValue<string>('jwt.access.secret');
  }

  get accessExpiresIn(): string {
    return this.getValue<string>('jwt.access.expiresIn');
  }

  get recoverySecret(): string {
    return this.getValue<string>('jwt.recovery.secret');
  }

  get recoveryExpiresIn(): string {
    return this.getValue<string>('jwt.recovery.expiresIn');
  }
}
