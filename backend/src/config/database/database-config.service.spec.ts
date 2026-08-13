import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseConfigService } from './database-config.service';

describe('DatabaseConfigService', () => {
  let databaseConfigService: DatabaseConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = { get: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [DatabaseConfigService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();
    databaseConfigService = moduleRef.get(DatabaseConfigService);
  });

  describe('url', () => {
    it('returns the configured database connection URL', () => {
      const expectedUrl = 'postgresql://localhost:5432/lib_app';
      mockConfigService.get.mockReturnValue(expectedUrl);
      const actualUrl: string = databaseConfigService.url;
      expect(actualUrl).toBe(expectedUrl);
      expect(mockConfigService.get).toHaveBeenCalledWith('db.url');
    });
  });
});
