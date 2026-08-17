import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { MailConfigService } from './mail-config.service';

describe('MailConfigService', () => {
  let mailConfigService: MailConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = { get: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [MailConfigService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();
    mailConfigService = moduleRef.get(MailConfigService);
  });

  describe('from', () => {
    it('returns the configured sender address', () => {
      mockConfigService.get.mockReturnValue('noreply@example.com');
      const actualFrom: string = mailConfigService.from;
      expect(actualFrom).toBe('noreply@example.com');
      expect(mockConfigService.get).toHaveBeenCalledWith('mail.from');
    });
  });

  describe('smtpHost', () => {
    it('returns the configured SMTP host', () => {
      mockConfigService.get.mockReturnValue('localhost');
      const actualHost: string = mailConfigService.smtpHost;
      expect(actualHost).toBe('localhost');
      expect(mockConfigService.get).toHaveBeenCalledWith('mail.smtpHost');
    });
  });

  describe('smtpPort', () => {
    it('returns the configured SMTP port', () => {
      mockConfigService.get.mockReturnValue(1025);
      const actualPort: number = mailConfigService.smtpPort;
      expect(actualPort).toBe(1025);
      expect(mockConfigService.get).toHaveBeenCalledWith('mail.smtpPort');
    });
  });

  describe('smtpSecure', () => {
    it('returns whether SMTP uses TLS on connect', () => {
      mockConfigService.get.mockReturnValue(false);
      const actualSecure: boolean = mailConfigService.smtpSecure;
      expect(actualSecure).toBe(false);
      expect(mockConfigService.get).toHaveBeenCalledWith('mail.smtpSecure');
    });
  });

  describe('smtpUser', () => {
    it('returns null when SMTP credentials are omitted', () => {
      mockConfigService.get.mockReturnValue(null);
      const actualUser: string | null = mailConfigService.smtpUser;
      expect(actualUser).toBeNull();
      expect(mockConfigService.get).toHaveBeenCalledWith('mail.smtpUser');
    });
  });

  describe('smtpPassword', () => {
    it('returns null when SMTP credentials are omitted', () => {
      mockConfigService.get.mockReturnValue(null);
      const actualPassword: string | null = mailConfigService.smtpPassword;
      expect(actualPassword).toBeNull();
      expect(mockConfigService.get).toHaveBeenCalledWith('mail.smtpPassword');
    });
  });
});
