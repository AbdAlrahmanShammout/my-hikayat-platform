import nodemailer from 'nodemailer';

import { MailConfigService } from '@/config/mail/mail-config.service';

import { createSmtpTransport } from './smtp-mail-client.factory';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}));

describe('createSmtpTransport', () => {
  const mockCreateTransport = nodemailer.createTransport as jest.MockedFunction<
    typeof nodemailer.createTransport
  >;

  beforeEach(() => {
    mockCreateTransport.mockReset();
    mockCreateTransport.mockReturnValue({ sendMail: jest.fn() });
  });

  it('omits auth when credentials are not configured', () => {
    createSmtpTransport({
      smtpHost: 'localhost',
      smtpPort: 1025,
      smtpSecure: false,
      smtpUser: null,
      smtpPassword: null,
    } as MailConfigService);
    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'localhost',
      port: 1025,
      secure: false,
      auth: undefined,
    });
  });

  it('includes auth when SMTP credentials are configured', () => {
    createSmtpTransport({
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpSecure: true,
      smtpUser: 'mailer',
      smtpPassword: 'secret',
    } as MailConfigService);
    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: true,
      auth: {
        user: 'mailer',
        pass: 'secret',
      },
    });
  });
});
