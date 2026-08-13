import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { DatabaseConfigService } from '@/config/database/database-config.service';

@Injectable()
export class PrismaProviderService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaProviderService.name);

  constructor(databaseConfigService: DatabaseConfigService) {
    super({
      datasources: {
        db: {
          url: databaseConfigService.url,
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
