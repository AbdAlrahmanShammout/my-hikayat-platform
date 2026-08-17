import { Injectable } from '@nestjs/common';

import { SendMailInput, SentMailMessage } from '@/providers/mail/defs/mail-manager.defs';
import { MailManagerService } from '@/providers/mail/mail-manager.service';

@Injectable()
export class MemoryMailManagerService extends MailManagerService {
  private readonly sent: SentMailMessage[] = [];

  async send(input: SendMailInput): Promise<void> {
    await Promise.resolve();
    this.sent.push({
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }

  readSentMessages(): readonly SentMailMessage[] {
    return [...this.sent];
  }
}
