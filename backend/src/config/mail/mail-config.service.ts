import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class MailConfigService extends BaseConfigService {
  get from(): string {
    return this.getValue<string>('mail.from');
  }

  get smtpHost(): string {
    return this.getValue<string>('mail.smtpHost');
  }

  get smtpPort(): number {
    return this.getValue<number>('mail.smtpPort');
  }

  get smtpSecure(): boolean {
    return this.getValue<boolean>('mail.smtpSecure');
  }

  get smtpUser(): string | null {
    return this.getValue<string | null>('mail.smtpUser');
  }

  get smtpPassword(): string | null {
    return this.getValue<string | null>('mail.smtpPassword');
  }
}
