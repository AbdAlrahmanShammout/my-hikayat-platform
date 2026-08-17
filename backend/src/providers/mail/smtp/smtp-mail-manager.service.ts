import { Inject, Injectable } from '@nestjs/common';
import type { Transporter } from 'nodemailer';

import { MailConfigService } from '@/config/mail/mail-config.service';
import { MAIL_TRANSPORTER } from '@/providers/mail/consts';
import { SendMailInput } from '@/providers/mail/defs/mail-manager.defs';
import { MailFailureException } from '@/providers/mail/exceptions/mail-failure.exception';
import { MailManagerService } from '@/providers/mail/mail-manager.service';

@Injectable()
export class SmtpMailManagerService extends MailManagerService {
  constructor(
    @Inject(MAIL_TRANSPORTER) private readonly transporter: Transporter,
    private readonly mailConfigService: MailConfigService,
  ) {
    super();
  }

  async send(input: SendMailInput): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.mailConfigService.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
    } catch (err: unknown) {
      if (err instanceof MailFailureException) {
        throw err;
      }
      throw new MailFailureException();
    }
  }
}
