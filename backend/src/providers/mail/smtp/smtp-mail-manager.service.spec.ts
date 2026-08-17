import { MailConfigService } from '@/config/mail/mail-config.service';
import { MailFailureException } from '@/providers/mail/exceptions/mail-failure.exception';

import { SmtpMailManagerService } from './smtp-mail-manager.service';

describe('SmtpMailManagerService', () => {
  it('sends through the transport using the configured from address', async () => {
    const mockTransporter = { sendMail: jest.fn().mockResolvedValue(undefined) };
    const mockMailConfigService = { from: 'noreply@example.com' };
    const smtpMailManagerService = new SmtpMailManagerService(
      mockTransporter,
      mockMailConfigService as unknown as MailConfigService,
    );
    await smtpMailManagerService.send({
      to: 'new-admin@example.com',
      subject: 'You are invited to administer Noory',
      text: 'Open the invitation link.',
    });
    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: 'noreply@example.com',
      to: 'new-admin@example.com',
      subject: 'You are invited to administer Noory',
      text: 'Open the invitation link.',
      html: undefined,
    });
  });

  it('translates transport failures into MailFailureException', async () => {
    const mockTransporter = { sendMail: jest.fn().mockRejectedValue(new Error('smtp down')) };
    const mockMailConfigService = { from: 'noreply@example.com' };
    const smtpMailManagerService = new SmtpMailManagerService(
      mockTransporter,
      mockMailConfigService as unknown as MailConfigService,
    );
    await expect(
      smtpMailManagerService.send({
        to: 'new-admin@example.com',
        subject: 'You are invited to administer Noory',
        text: 'Open the invitation link.',
      }),
    ).rejects.toBeInstanceOf(MailFailureException);
  });
});
