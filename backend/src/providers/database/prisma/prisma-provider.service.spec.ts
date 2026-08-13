import { DatabaseConfigService } from '@/config/database/database-config.service';

import { PrismaProviderService } from './prisma-provider.service';

describe('PrismaProviderService', () => {
  it('connects on module init and disconnects on destroy', async () => {
    const mockDatabaseConfigService: Pick<DatabaseConfigService, 'url'> = {
      url: 'postgresql://localhost:5432/lib_app_test',
    };
    const prismaProviderService = new PrismaProviderService(
      mockDatabaseConfigService as DatabaseConfigService,
    );
    const mockConnect = jest.spyOn(prismaProviderService, '$connect').mockResolvedValue(undefined);
    const mockDisconnect = jest
      .spyOn(prismaProviderService, '$disconnect')
      .mockResolvedValue(undefined);
    await prismaProviderService.onModuleInit();
    await prismaProviderService.onModuleDestroy();
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    mockConnect.mockRestore();
    mockDisconnect.mockRestore();
  });
});
