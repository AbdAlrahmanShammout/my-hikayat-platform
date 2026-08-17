import { SendMailInput } from '@/providers/mail/defs/mail-manager.defs';

export abstract class MailManagerService {
  abstract send(input: SendMailInput): Promise<void>;
}
